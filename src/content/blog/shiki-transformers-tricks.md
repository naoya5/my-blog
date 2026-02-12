---
title: "Shiki Transformersでコード差分を読みやすくする"
description: "行ハイライトとDiff表現を組み合わせて、記事内コードの意図を伝える。"
pubDate: "2026-01-15"
tags: ["shiki", "markdown", "dx"]
draft: false
---

## 変更意図を視覚化する

コードブロック内で `++` と `--` を使うと、どこが追加/削除なのか直感的に伝わります。

```ts
const config = {
  output: 'static', // [!code ++]
  adapter: cloudflare(), // [!code ++]
  legacyMode: true, // [!code --]
};
```

## メタ文字列ハイライト

```ts {2-3}
const title = 'Signal & Sprocket';
const description = 'Astro実装メモ';
const tags = ['astro', 'ssg'];
```

この2つを併用すると、レビュー時の説明量を減らせます。
