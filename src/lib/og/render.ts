import { Resvg } from '@resvg/resvg-js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import satori from 'satori';

// ビルド時にのみ実行される（OG エンドポイントは静的にプリレンダリングされる）。
// 日本語フォントは初回のみ CDN から取得し、.cache/og-fonts にキャッシュする。
const CACHE_DIR = path.resolve('.cache/og-fonts');
const EYEBROW = 'AGENTIC SIGNAL';

const FONT_SOURCES = [
  {
    weight: 400 as const,
    file: 'noto-sans-jp-400.otf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-jp/NotoSansJP_400Regular.ttf',
  },
  {
    weight: 700 as const,
    file: 'noto-sans-jp-700.otf',
    url: 'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-jp/NotoSansJP_700Bold.ttf',
  },
];

// ブランドパレット。global.css の CSS カスタムプロパティ（--accent / --line / --text-main 等）と
// 同じ値の写し。OG 画像は Node 上のビルド時に生成され CSS 変数を参照できないため、ここで複製している。
// global.css 側のブランドカラーを変えたら、この定数も合わせて更新すること。
const COLOR = {
  bg: 'rgb(247, 243, 237)',
  bgAccent: 'rgb(241, 230, 218)',
  text: 'rgb(32, 30, 27)',
  muted: 'rgb(96, 90, 82)',
  accent: 'rgb(135, 90, 58)',
  line: 'rgb(219, 211, 201)',
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// sfnt フォントのシグネチャ（OTTO / TrueType / 'true' / 'ttcf'）と最小サイズで破損を弾く。
function looksLikeFont(buf: Buffer): boolean {
  if (buf.length < 1024) return false;
  const sig = buf.readUInt32BE(0);
  return sig === 0x4f54544f || sig === 0x00010000 || sig === 0x74727565 || sig === 0x74746366;
}

async function fetchFont(url: string, attempts = 3): Promise<Buffer> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!looksLikeFont(buf)) throw new Error(`不正なフォントデータ (${buf.length} bytes)`);
      return buf;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(300 * 2 ** (attempt - 1));
    }
  }
  throw new Error(`OG フォントの取得に失敗しました（${attempts}回試行）: ${url} — ${String(lastError)}`);
}

async function loadFont(source: (typeof FONT_SOURCES)[number]): Promise<Buffer> {
  const cached = path.join(CACHE_DIR, source.file);
  try {
    const buf = await fs.readFile(cached);
    if (looksLikeFont(buf)) return buf;
    // 破損・切り詰めキャッシュ（中断した書き込み等）は無視して取り直す。
  } catch {
    // キャッシュミス。
  }

  const buf = await fetchFont(source.url);
  await fs.mkdir(CACHE_DIR, { recursive: true });
  // アトミック書き込み: 一時ファイルへ書いてから rename（同一 FS 上で原子的）。
  const tmp = `${cached}.${process.pid}.tmp`;
  await fs.writeFile(tmp, new Uint8Array(buf));
  await fs.rename(tmp, cached);
  return buf;
}

let fontsPromise: Promise<Array<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }>> | null = null;

function getFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      FONT_SOURCES.map(async (source) => ({
        name: 'Noto Sans JP',
        data: await loadFont(source),
        weight: source.weight,
        style: 'normal' as const,
      })),
    ).catch((error) => {
      // 失敗した Promise をキャッシュし続けない。次の呼び出しで再取得できるようにする。
      fontsPromise = null;
      throw error;
    });
  }
  return fontsPromise;
}

function titleFontSize(title: string): number {
  const len = [...title].length;
  if (len <= 28) return 72;
  if (len <= 48) return 60;
  if (len <= 72) return 50;
  return 42;
}

function clamp(value: string, max: number): string {
  const chars = [...value];
  return chars.length > max ? `${chars.slice(0, max - 1).join('')}…` : value;
}

export interface OgImageInput {
  title: string;
  subtitle?: string;
  domain?: string;
}

// satori は React 要素そのままのプレーンオブジェクト（{ type, props }）を受け取れる。
function buildCard({ title, subtitle, domain }: Required<OgImageInput>) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        backgroundColor: COLOR.bg,
        backgroundImage: `linear-gradient(135deg, ${COLOR.bg} 0%, ${COLOR.bgAccent} 100%)`,
        fontFamily: 'Noto Sans JP',
        position: 'relative',
      },
      children: [
        // 左端のアクセントバー
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: '0px',
              top: '0px',
              bottom: '0px',
              width: '14px',
              backgroundColor: COLOR.accent,
            },
          },
        },
        // 上段: eyebrow
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: COLOR.accent,
            },
            children: EYEBROW,
          },
        },
        // 中段: タイトル + サブタイトル
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: '24px' },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: `${titleFontSize(title)}px`,
                    fontWeight: 700,
                    lineHeight: 1.28,
                    color: COLOR.text,
                  },
                  children: clamp(title, 90),
                },
              },
              subtitle
                ? {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        fontSize: '28px',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        color: COLOR.muted,
                      },
                      children: clamp(subtitle, 110),
                    },
                  }
                : null,
            ].filter(Boolean),
          },
        },
        // 下段: ドメイン
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '24px',
              fontWeight: 700,
              color: COLOR.muted,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', width: '40px', height: '4px', backgroundColor: COLOR.accent },
                },
              },
              { type: 'div', props: { style: { display: 'flex' }, children: domain } },
            ],
          },
        },
      ],
    },
  };
}

export async function renderOgImage(input: OgImageInput): Promise<Buffer> {
  const fonts = await getFonts();
  const svg = await satori(
    buildCard({
      title: input.title,
      subtitle: input.subtitle ?? '',
      domain: input.domain ?? '',
    }) as unknown as Parameters<typeof satori>[0],
    {
      width: 1200,
      height: 630,
      fonts: fonts.map((f) => ({ name: f.name, data: f.data, weight: f.weight, style: f.style })),
    },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  return resvg.render().asPng();
}
