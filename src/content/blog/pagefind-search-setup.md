---
title: "Pagefindで静的検索を組み込む"
description: "クライアント側だけで完結する全文検索を導入し、ビルド後にインデックスを生成する。"
pubDate: "2026-01-25"
heroImage: "./images/wave.svg"
tags: ["pagefind", "search", "performance"]
draft: false
---

## ビルド後にインデックスを作る

Pagefindは `dist` に対して実行します。ビルドスクリプトは次の形が扱いやすいです。

```json
{
  "scripts": {
    "build": "astro check && astro build && pagefind --site dist"
  }
}
```

## UIのマウントポイントを明確にする

検索UIはサイドバーに限定し、`#search` 要素にだけマウントします。
これで複数ページ遷移時の副作用を減らせます。

```js
new window.PagefindUI({
  element: '#search',
  showSubResults: true,
});
```

> [!NOTE]
> 開発サーバーでは `/_pagefind/*` が存在しないため、404ログは仕様です。
