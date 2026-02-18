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

## トラブルシューティング

### Corepack の `Cannot find matching keyid` が出る場合

`corepack` の署名キー不整合で発生します。以下で `corepack` を介さず `pnpm` を固定してください。

```bash
npm install -g pnpm@9.15.5
pnpm --version
```

## コンテンツ運用

記事は `src/content/blog/` 配下の Markdown で管理します。  
frontmatter は `src/content/config.ts` のスキーマで検証されます。

```md
---
title: "記事タイトル"
description: "記事の説明"
pubDate: 2026-02-13
updatedDate: 2026-02-13
heroImage: "./images/hero.jpg" # または https://... の外部URL
tags: ["astro", "tailwind"]
draft: false
---
```

`draft: true` は本番ビルドで除外されます。
外部URL画像を使う場合は `astro.config.mjs` の `image.domains` 設定が必要です。

## デプロイ

Cloudflare Pages を利用します。

```bash
pnpm deploy
```

### 自動デプロイ（記事追加 / draft変更）

`.github/workflows/deploy-content-to-cloudflare.yml` により、`main` ブランチへの push 時に以下の場合のみ自動デプロイされます。

- `src/content/blog/**/*.md` の新規追加
- `draft` フィールドの変更（`false -> true` / `true -> false`）

事前に GitHub Secrets を設定してください。

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

補足:
- Cloudflare Pages の Git 連携も有効にしている場合、二重デプロイになります。どちらか一方に統一してください。

## 公開前に変更する設定

- `astro.config.mjs` の `site` は現在 `https://example.com` です
- 本番ドメインへ変更してください（RSS / sitemap / OGP URL に影響）

## ドキュメント

詳細設計・実装メモは `docs/` にあります。

- `docs/00-PROJECT-OVERVIEW.md`
- `docs/01-SETUP-GUIDE.md`
- `docs/02-CONTENT-COLLECTIONS.md`
- `docs/08-MARKDOWN-PLUGINS.md`
- `docs/11-HOSTING-DECISION-GUIDE.md`（ホスティング比較・料金・運用方針）
- `BLOG_PUBLISHING_WORKFLOW.md`（記事執筆〜反映フロー）
