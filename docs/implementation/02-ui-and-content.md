# 実装ログ 02: UI基盤とコンテンツモデル

更新日: 2026-02-12

## 目的
`docs/02-CONTENT-COLLECTIONS.md` と `docs/03-COMPONENTS-LAYOUTS.md` に沿って、再利用可能なUIと記事データモデルを整備する。

## 実施内容
- レイアウト/共通UIを新規作成
  - `BaseLayout`, `BaseHead`, `Header`, `Footer`, `ThemeToggle`
  - `global.css` にテーマ変数、ダークモード、Markdown拡張用スタイルを実装
- ブログ用コンポーネントを作成
  - `BlogCard`, `ReadingTime`, `TableOfContents`, `Tag`, `Pagination`, `Search`
- Content Collectionsを実装
  - `src/content/config.ts` に `blog` スキーマ定義
  - `heroImage`, `tags`, `draft` を含む型安全な Frontmatter を導入
- サンプル記事と画像を追加
  - 7記事 (`src/content/blog/*.md`)
  - SVGヒーロー画像 (`src/content/blog/images/*.svg`)

## 関連ファイル
- `src/layouts/BaseLayout.astro`
- `src/components/layout/BaseHead.astro`
- `src/components/blog/BlogCard.astro`
- `src/content/config.ts`
- `src/content/blog/`
