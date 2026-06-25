# アーキテクチャ

> Agentic Signal (my-blog) の全体構成マップ。詳細実装ではなく「どこに何があるか」を示す。

## 全体像
Astro 5 の静的サイトジェネレーター(`output: 'static'`)。Markdown 記事を Content Collections として読み込み、ファイルベースルーティングで HTML/RSS/sitemap/OG 画像を**ビルド時に**生成し、Cloudflare Pages アダプタ(`@astrojs/cloudflare`)で出力する。`astro.config.mjs` の `site` がドメインの単一の真実の源で、canonical・OG・sitemap・robots.txt・RSS・構造化データすべてに伝播する。

## 層と依存方向
<!-- 実 import で裏取りした事実。依存は前方(下向き)にのみ流れる。 -->
```
Content Collections   src/content/blog/*.md  (+ config.ts の Zod スキーマ)
        ↓ getCollection / getStaticPaths
Pages (routing)       src/pages/**           (index, blog/[slug], blog/tag/[tag], blog/page/[page], og/*, rss.xml, robots.txt)
        ↓ ラップ
Layout                src/layouts/BaseLayout.astro
        ↓ 構成
Components             src/components/{layout, blog, ui, seo}/*
        ↓ 利用
Shared logic          src/utils/* (投稿取得・ソート・関連記事・日付)  /  src/lib/og/* (OG 画像生成)
        ↓ 参照
Config / Constants    astro.config.mjs (site/markdown)  /  src/consts.ts (サイト定数)
```
横断的関心事(SEO メタ・JSON-LD・OG 画像・Pagefind 検索)は BaseLayout→BaseHead と専用エンドポイントで注入される。

## 主要コンポーネント
| コンポーネント | 場所 | 役割 |
|--------------|------|------|
| ルーティング/設定 | `astro.config.mjs`, `src/consts.ts` | `site` 単一真実源・Markdown パイプライン・サイト定数 |
| コンテンツスキーマ | `src/content/config.ts` | `blog` コレクションの Zod スキーマ(frontmatter 契約) |
| マスターレイアウト | `src/layouts/BaseLayout.astro` | 全ページ共通の枠(BaseHead/Header/Footer/SearchModal/ClientRouter) |
| SEO/メタ | `src/components/layout/BaseHead.astro`, `src/components/seo/JsonLd.astro` | OG/Twitter/canonical メタ・WebSite/Organization の JSON-LD |
| 投稿クエリ | `src/utils/getSortedPosts.ts`, `getRelatedPosts.ts` | draft 除外+日付降順ソート・タグ類似で関連記事抽出 |
| OG 画像生成 | `src/lib/og/render.ts`, `src/pages/og/[...slug].png.ts` | satori(JSX→SVG)+resvg(SVG→PNG)でビルド時 PNG 出力 |
| 全文検索 | `src/components/layout/SearchModal.astro`, `src/components/blog/Search.astro` | Pagefind による静的全文検索 UI |
| 記事同期 | `scripts/notion-sync.mjs` | Notion DB → `src/content/blog/*.md` への変換 |

## エントリポイント
- `src/pages/index.astro` — ホーム(最新5記事)
- `src/pages/blog/index.astro` — 記事一覧 / `blog/[slug].astro` — 個別記事(関連記事+JSON-LD) / `blog/page/[page].astro` — ページネーション(6件/頁) / `blog/tag/[tag].astro` — タグ別
- `src/pages/og/[...slug].png.ts` — OG 画像 / `rss.xml.ts` — RSS / `robots.txt.ts` — robots.txt(動的生成)
- ルーティング・スキーマの詳細規約は [api-pattern.md](api-pattern.md)。

## データ/制御フロー
1. **執筆**: Notion で予約投稿 → `notion-sync.yml`(10分毎)が `pnpm notion:sync` を実行 → `src/content/blog/*.md` を生成・commit。手動 Markdown 追加も可。
2. **ビルド**: `pnpm build` = `astro check`(型検査ゲート) → `astro build`(SSG: HTML/RSS/sitemap/OG PNG 生成) → `pagefind --site dist`(検索インデックス化)。
3. **デプロイ**: `src/content/blog/**` への push で `deploy-content-to-cloudflare.yml` が発火 → `wrangler pages deploy ./dist`。CSP の sha256 が変わる場合は `public/_headers` を更新。
4. **配信**: Cloudflare Pages が静的アセット + `public/_headers`(CSP/セキュリティヘッダ/キャッシュ)を配信。

<!-- 150行を超えたら、サブトピックを docs/<topic>.md に分割し入口リンクを差し替える。 -->
