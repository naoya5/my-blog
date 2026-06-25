# API / インターフェース規約

> Agentic Signal (my-blog) の横断的な IF パターン。個々の実装ではなく "規約" を書く。型の詳細はコード内コメントを正とする。

## 命名・パス規約
- パスエイリアス: `@components/* @layouts/* @assets/* @styles/* @utils/*`(`tsconfig.json`)。相対パスより優先。
- ユーティリティ関数は camelCase で動詞始まり(`getSortedPosts` / `getRelatedPosts` / `formatDate`)。`src/utils/<name>.ts` に1機能1ファイル。
- サイト全体の定数は `src/consts.ts` に UPPER_SNAKE(`SITE_TITLE` / `OG_IMAGE_WIDTH` 等)。
- TypeScript は `astro/tsconfigs/strict` 準拠。

## 記事 frontmatter スキーマ(`src/content/config.ts` の `blog` コレクション)
契約は Zod で定義。フィールドを足す/変える時は**必ずこのスキーマを更新**する(ドリフト禁止)。
- `title` (string, 必須) / `description` (string, 必須)
- `pubDate` (date, 必須) / `updatedDate` (date, 任意)
- `heroImage` (任意) — ローカル画像 or `https://` の外部 URL。**外部は許可ホスト `images.unsplash.com` のみ**(`ALLOWED_EXTERNAL_IMAGE_HOSTS`)。
- `tags` (string[], 既定 `[]`) / `category` (enum `"deep-dive" | "daily"`, 既定 `"deep-dive"`)
- `draft` (boolean, 既定 `false`) — 本番ビルドで除外(`getSortedPosts` が `import.meta.env.PROD` 時にフィルタ)。

## 動的ルート規約(`src/pages/`)
- ファイル名のブラケットがパラメータ: `[slug]`(個別記事) / `[tag]`(タグ別) / `[page]`(ページネーション, 6件/頁) / `[...slug]`(OG 画像の rest)。
- 各ページは `getStaticPaths()` で全 route をビルド時に列挙し、`params`(URL) と `props`(描画データ)を分離して返す。関連記事のような派生データは `getStaticPaths` 内で**事前計算**して props で渡す。
- `.ts` エンドポイント(`rss.xml.ts` / `robots.txt.ts` / `og/[...slug].png.ts`)は `GET(context) → Response` 署名。canonical は `context.site`(= `astro.config.mjs` の `site`)から導出する。

## コンポーネント Props 規約
- props は frontmatter(`---`)で `interface Props` を定義し、必須/任意(`?`)を明示。
- `BaseLayout` の主要 props: `title`(必須) / `description?` / `image?` / `type?: 'website'|'article'` / `publishedTime?` / `modifiedTime?` / `tags?` / `noindex?`。記事ページは `type="article"` + 日付/タグを渡す。
- 投稿を扱うコンポーネントは `CollectionEntry<'blog'>` 型を受け取る(独自型を作らない)。

## SEO / 構造化データ規約
- メタタグ(OG/Twitter/canonical)は `BaseHead.astro` に集約。個別ページで `<head>` を直接いじらない。
- JSON-LD は `JsonLd.astro` 経由。**WebSite + Organization** は全ページ(BaseHead)、**BlogPosting + BreadcrumbList** は個別記事(`blog/[slug].astro`)で出力。
- OG 画像はビルド時生成: `/og/default.png`(サイト既定) と `/og/blog/<slug>.png`(記事別)。フォントは `.cache/og-fonts` にキャッシュ(リトライ+破損検出あり)。詳細は `src/lib/og/render.ts`。

## HTTP ヘッダ / CSP 規約(`public/_headers`)
- **CSP `script-src` は手動 allowlist**: `'self' 'wasm-unsafe-eval'` + インライン script の sha256 ハッシュ列。インライン `<script>` を足したら `node calc-hash.mjs`(build 後の `dist/` を走査)で新ハッシュを算出し `_headers` に追記する。漏れると本番でスクリプトがブロックされる。
- セキュリティヘッダ: `Referrer-Policy` / `X-Content-Type-Options: nosniff` / `X-Frame-Options: DENY` / HSTS(preload) / `Permissions-Policy` 全無効。
- キャッシュ: `/og/*` は `max-age=86400, must-revalidate`(URL 固定・内容はタイトル依存のため日次再検証)。

<!-- 型の詳細はコード内コメントに置き、ここには規約(パターン)のみを書く。 -->
