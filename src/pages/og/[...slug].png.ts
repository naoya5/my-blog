import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';
import { renderOgImage } from '../../lib/og/render';

// 静的出力なので、各 OG 画像はビルド時に PNG として書き出される。
// - /og/default.png            … サイト共通の既定 OG 画像
// - /og/blog/<slug>.png        … 記事ごとの OG 画像
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true));

  return [
    {
      params: { slug: 'default' },
      props: { title: SITE_TITLE, subtitle: SITE_DESCRIPTION },
    },
    ...posts.map((post) => ({
      params: { slug: `blog/${post.slug}` },
      props: { title: post.data.title, subtitle: post.data.description },
    })),
  ];
};

export const GET: APIRoute = async ({ props, site }) => {
  const domain = site ? site.host : '';
  // 空文字タイトル（Zod の z.string() は '' を許容）はサイト名にフォールバックする。
  const rawTitle = typeof props.title === 'string' ? props.title.trim() : '';
  const png = await renderOgImage({
    title: rawTitle || SITE_TITLE,
    subtitle: typeof props.subtitle === 'string' ? props.subtitle : undefined,
    domain,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      // URL は slug で固定だが画像内容は記事のタイトル/説明に依存するため immutable にはしない。
      // 編集→再ビルド後に更新が伝播するよう日次で再検証させる（実体の制御は public/_headers の /og/* も参照）。
      'Cache-Control': 'public, max-age=86400, must-revalidate',
    },
  });
};
