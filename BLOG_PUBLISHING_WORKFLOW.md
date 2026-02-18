# Blog Publishing Workflow

このドキュメントは、`src/content/blog/` に記事を追加してサイトへ反映するまでの実行手順です。  
今回のサンプル記事として、`src/content/blog/langchain-deepagent-practical-guide.md` を追加しています。

## 1. 記事ファイルを作成

`src/content/blog/` に slug 名で Markdown を追加します。

```bash
touch src/content/blog/<slug>.md
```

例:

```bash
touch src/content/blog/langchain-deepagent-practical-guide.md
```

## 2. Frontmatter を記述

`src/content/config.ts` のスキーマに従って記述します。

```md
---
title: "記事タイトル"
description: "記事概要"
pubDate: "2026-02-16"
updatedDate: "2026-02-16"
heroImage: "./images/hero.jpg"
tags: ["tag1", "tag2"]
draft: false
---
```

必須: `title`, `description`, `pubDate`
任意: `updatedDate`, `heroImage`, `tags`, `draft`

`heroImage` は以下の2形式に対応します。

- ローカル画像: `heroImage: "./images/hero.jpg"`
- 外部URL: `heroImage: "https://images.unsplash.com/photo-..."`

外部URLを使う場合は、`astro.config.mjs` の `image.domains` に許可ドメインを追加してください。

## 3. 本文を執筆

- 見出し (`##`, `###`) を使って構造化
- コードブロック、アラート、リンクカードを活用可能
- 長文は「背景 → 設計 → 実装 → 評価 → まとめ」の順が推奨

## 4. ローカル確認

```bash
pnpm dev
```

確認ポイント:

- `/blog` の一覧表示
- `/blog/<slug>/` の詳細表示
- `/blog/tag/<tag>/` のタグ導線
- OGP（`og:image` / `twitter:image`）に画像が反映されること

## 5. 本番ビルド検証

```bash
pnpm build
```

実行内容:

- `astro check`
- `astro build`
- `pagefind --site dist`

## 6. デプロイ反映

```bash
pnpm deploy
```

推奨順序:

1. `pnpm build`
2. `pnpm deploy`

また、`main` への push で次の条件に一致すると GitHub Actions から自動デプロイされます。

- `src/content/blog/**/*.md` の新規追加
- `draft` の変更（`false -> true` または `true -> false`）

ワークフロー: `.github/workflows/deploy-content-to-cloudflare.yml`

## 7. 公開チェックリスト

- [ ] `draft: false`
- [ ] `title` / `description` の最終確認
- [ ] `heroImage` の表示とリンク有効性の確認（設定した場合）
- [ ] 画像の利用ライセンス/出典を確認
- [ ] タグ設定の確認
- [ ] `pnpm build` 成功
- [ ] 記事ページと一覧ページの表示確認
