---
title: "Content Collectionsを中核にした記事管理"
description: "型安全なフロントマターとドラフト運用を前提に、Astroブログの土台を設計したメモ。"
pubDate: "2026-02-01"
updatedDate: "2026-02-10"
heroImage: "./images/lattice.svg"
tags: ["astro", "content-collections", "typescript"]
draft: false
---

## 先にスキーマを固める

`src/content/config.ts` でスキーマを定義してから記事を書くと、公開フローが安定します。
`draft` や `tags` のような運用項目も最初から決めておくと、後で手戻りが減ります。

```ts {1,6-8}
const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      heroImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});
```

## 本番時だけドラフトを除外

開発中はすべての記事を見たいので、ビルド時だけ除外する条件を使います。

```ts
const posts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? !data.draft : true;
});
```

> [!TIP]
> ドラフト運用は「公開日時を決める前の検証記事」を扱うときに特に効きます。

[Astro Content Collections公式ガイド](https://docs.astro.build/en/guides/content-collections/)
