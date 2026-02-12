---
title: "Cloudflare Pagesにデプロイする運用メモ"
description: "静的出力を前提に、Wrangler CLIで配信する最小構成の手順。"
pubDate: "2026-01-22"
heroImage: "./images/blocks.svg"
tags: ["cloudflare", "deploy", "ops"]
draft: false
---

## 設定ファイルを固定する

`wrangler.jsonc` にビルド出力を明示しておくと、CIでもローカルでも挙動が揃います。

```json
{
  "name": "my-blog",
  "pages_build_output_dir": "./dist"
}
```

## 実行コマンド

```bash
pnpm build
wrangler pages deploy ./dist
```

## 先にやるべきこと

- `site` URLを本番ドメインへ変更
- `robots.txt` のSitemap URLを本番値へ変更
- カスタムドメイン設定後にOGP検証
