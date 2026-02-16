# Signal & Sprocket

Astro 5 で構築した、静的配信向けの技術ブログ実装です。  
「速く、壊れにくく、運用しやすい」ブログをテーマに、コンテンツ管理から検索・配信までを一通り実装しています。

## このリポジトリで分かること

- Astro Content Collections を使った型安全な Markdown 運用
- ブログの基本導線（一覧、詳細、タグ、ページネーション）
- 静的サイト全文検索（Pagefind）の組み込み
- RSS / sitemap / 構造化データなどの SEO 基盤
- Cloudflare Pages へのデプロイ構成

## 主な機能

- 記事一覧・詳細・タグ別一覧・ページネーション
- 関連記事表示、読了時間表示、目次表示
- Pagefind による全文検索
- RSS (`/rss.xml`) と sitemap の自動生成
- ダークモード対応
- Markdown 拡張
- `remark-link-card-plus`（リンクカード）
- `remark-github-blockquote-alert`（GitHub 風アラート）
- Shiki + Transformers（コードの diff / 行ハイライト）

## 技術スタック

- Framework: Astro 5
- Language: TypeScript
- Styling: Tailwind CSS
- Search: Pagefind
- Hosting: Cloudflare Pages
- Package manager: pnpm

## クイックスタート

### 1. 依存関係をインストール

```bash
pnpm install
```

### 2. 開発サーバー起動

```bash
pnpm dev
```

`http://localhost:4321` で確認できます。

### 3. 本番ビルド

```bash
pnpm build
```

型チェック、静的ビルド、Pagefind インデックス生成を実行します。

## npm scripts

- `pnpm dev`: 開発サーバー
- `pnpm start`: `pnpm dev` のエイリアス
- `pnpm build`: `astro check && astro build && pagefind --site dist`
- `pnpm preview`: ビルド結果のプレビュー
- `pnpm deploy`: Cloudflare Pages へデプロイ
- `pnpm astro`: Astro CLI

## コンテンツ運用

記事は `src/content/blog/` 配下の Markdown で管理します。  
frontmatter は `src/content/config.ts` のスキーマで検証されます。

```md
---
title: "記事タイトル"
description: "記事の説明"
pubDate: 2026-02-13
updatedDate: 2026-02-13
tags: ["astro", "tailwind"]
draft: false
---
```

`draft: true` は本番ビルドで除外されます。

## デプロイ

Cloudflare Pages を利用します。

```bash
pnpm deploy
```

## 公開前に変更する設定

- `astro.config.mjs` の `site` は現在 `https://example.com` です
- 本番ドメインへ変更してください（RSS / sitemap / OGP URL に影響）

## ドキュメント

詳細設計・実装メモは `docs/` にあります。

- `docs/00-PROJECT-OVERVIEW.md`
- `docs/01-SETUP-GUIDE.md`
- `docs/02-CONTENT-COLLECTIONS.md`
- `docs/08-MARKDOWN-PLUGINS.md`
- `BLOG_PUBLISHING_WORKFLOW.md`（記事執筆〜反映フロー）
