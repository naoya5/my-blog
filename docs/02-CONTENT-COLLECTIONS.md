# Content Collections 実装ガイド

Astro の Content Collections を使用して、型安全なコンテンツ管理システムを構築するための包括的なガイドです。

## 目次

- [1. Content Collections の概要と利点](#1-content-collections-の概要と利点)
- [2. 設定方法 (src/content/config.ts)](#2-設定方法-srccontentconfigts)
- [3. Zod スキーマの定義](#3-zod-スキーマの定義)
- [4. Markdown ファイルの作成](#4-markdown-ファイルの作成)
- [5. コンテンツの取得とレンダリング](#5-コンテンツの取得とレンダリング)
- [6. 画像の扱い方 (image() ヘルパー)](#6-画像の扱い方-image-ヘルパー)
- [7. ドラフト機能の実装](#7-ドラフト機能の実装)
- [8. 従来の Markdown 処理との比較](#8-従来の-markdown-処理との比較)
- [9. 記事執筆から反映までの運用フロー](#9-記事執筆から反映までの運用フロー)
- [10. 関連ドキュメント](#10-関連ドキュメント)

---

## 1. Content Collections の概要と利点

Content Collections は、Astro プロジェクトにおける Markdown や MDX ファイルを管理するための最適な方法です。`src/content/` ディレクトリ内にコンテンツを配置し、スキーマを定義することで、以下のような利点が得られます。

- **型安全性**: TypeScript による自動補完と型チェックが有効になります。
- **バリデーション**: Zod を使用して Frontmatter の項目を強制し、ビルド時にエラーを検知できます。
- **パフォーマンス**: 従来の `Astro.glob()` よりも高速に動作し、大規模なサイトでもビルド時間を短縮できます。
- **画像の最適化**: `image()` ヘルパーを使用して、Frontmatter 内の画像を自動的に最適化できます。

---

## 2. 設定方法 (src/content/config.ts)

Content Collections を有効にするには、`src/content/config.ts` ファイルを作成し、コレクションを定義します。

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// ブログコレクションの定義
const blog = defineCollection({
	// type: 'content' は Markdown/MDX 用、'data' は JSON/YAML 用
	type: 'content',
	// Zod を使用したスキーマ定義
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		// 文字列を Date オブジェクトに変換
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		// ローカル画像 or 外部URL(https) を許可
		heroImage: z.union([
			image(),
			z.string().url().refine((url) => url.startsWith('https://')),
		]).optional(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

// 定義したコレクションをエクスポート
export const collections = { blog };
```

---

## 3. Zod スキーマの定義

スキーマを定義することで、コンテンツの品質を担保できます。主要なフィールドの定義例は以下の通りです。

| フィールド | 型 | 説明 |
| :--- | :--- | :--- |
| `title` | `z.string()` | 記事のタイトル。必須。 |
| `description` | `z.string()` | 記事の要約。SEO に使用。必須。 |
| `pubDate` | `z.coerce.date()` | 公開日。文字列を Date 型に変換。必須。 |
| `updatedDate` | `z.coerce.date()` | 更新日。任意。 |
| `heroImage` | `image() \| https URL` | アイキャッチ画像。ローカル/外部URL対応。任意。 |
| `tags` | `z.array(z.string())` | タグの配列。デフォルトは空配列。 |
| `draft` | `z.boolean()` | 下書きフラグ。デフォルトは `false`。 |

---

## 4. Markdown ファイルの作成

定義したスキーマに従って、`src/content/blog/` 内に Markdown ファイルを作成します。

```markdown
---
# src/content/blog/my-first-post.md
title: "初めてのブログ投稿"
description: "Astro Content Collections を使った最初の記事です。"
pubDate: "2026-01-27"
heroImage: "./images/hero.jpg"
tags: ["astro", "learning"]
draft: false
---

## はじめに

ここから記事の本文を記述します。
Content Collections を使うことで、この Frontmatter は厳密にチェックされます。
```

---

## 5. コンテンツの取得とレンダリング

### getCollection() による取得

`getCollection()` を使用して、特定のコレクションから記事を取得します。フィルタリングやソートも可能です。

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';

// すべての記事を取得（下書きを除外）
const posts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? !data.draft : true;
});

// 日付順にソート
const sortedPosts = posts.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---

<ul>
  {sortedPosts.map(post => (
    <li>
      <a href={`/blog/${post.slug}/`}>{post.data.title}</a>
      <time datetime={post.data.pubDate.toISOString()}>
        {post.data.pubDate.toLocaleDateString()}
      </time>
    </li>
  ))}
</ul>
```

### render() による本文の表示

個別の記事ページでは、`render()` 関数を使用して Markdown コンテンツを HTML に変換します。

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
// render() を呼び出して Content コンポーネントを取得
const { Content } = await post.render();
---

<h1>{post.data.title}</h1>
<Content />
```

---

## 6. 画像の扱い方 (image() ヘルパー)

このプロジェクトでは、`heroImage` に次の2形式を許可しています。

- ローカル画像（`image()` ヘルパー対象）
- 外部URL（`https://...`）

**設定例:**
```typescript
schema: ({ image }) => z.object({
  heroImage: z.union([
    image(),
    z.string().url().refine((url) => url.startsWith('https://')),
  ]).optional(),
})
```

**ローカル画像の使用例:**
```astro
---
import { Image } from 'astro:assets';
const { post } = Astro.props;
---
{post.data.heroImage && (
  <Image src={post.data.heroImage} alt={post.data.title} />
)}
```

**外部URL画像の使用例:**
```astro
{typeof post.data.heroImage === 'string' && (
  <img src={post.data.heroImage} alt={post.data.title} />
)}
```

外部URL画像を使う場合は、`astro.config.mjs` の `image.domains` に許可ドメインを登録してください。

---

## 7. ドラフト機能の実装

`draft` フィールドを使用して、公開前の記事を管理できます。開発環境では表示し、本番環境（ビルド時）では除外する実装が一般的です。

```typescript
// 取得時のフィルタリング例
const posts = await getCollection('blog', ({ data }) => {
  // 本番環境(PROD)の場合は draft: true を除外
  // 開発環境(DEV)の場合はすべて表示
  return import.meta.env.PROD ? !data.draft : true;
});
```

---

## 8. 従来の Markdown 処理との比較

| 機能 | Content Collections | 従来の方式 (Astro.glob) |
| :--- | :--- | :--- |
| **型安全性** | 強力 (自動生成される型) | 弱い (手動定義が必要) |
| **バリデーション** | ビルド時に Frontmatter を検証 | 実行時までエラーが不明 |
| **ビルド速度** | 高速 (キャッシュと最適化) | 低速 (ファイル数に比例) |
| **画像の最適化** | `image()` ヘルパーで統合 | 手動でのインポートが必要 |
| **データの扱い** | JSON/YAML もコレクション化可能 | Markdown が主 |

*Librarian の調査によると、大規模プロジェクトにおいて Content Collections は従来の方式よりも最大 5 倍高速にビルドされることが報告されています。*

---

## 9. 記事執筆から反映までの運用フロー

### 9-1. 新規記事を追加する

`src/content/blog/` に Markdown ファイルを作成します。  
ファイル名がそのまま slug になります。

```bash
touch src/content/blog/langchain-deepagent-practical-guide.md
```

この例では `/blog/langchain-deepagent-practical-guide/` が記事URLです。

### 9-2. Frontmatter をスキーマ準拠で書く

`src/content/config.ts` のスキーマに合わせて記述します。

```markdown
---
title: "LangChain DeepAgent実践ガイド: 単発LLMから継続実行エージェントへ"
description: "LangChainのDeepAgentを題材に、アーキテクチャ、状態管理、ツール実行、評価設計、運用までを長文で整理した実践ノート。"
pubDate: "2026-02-16"
updatedDate: "2026-02-16"
heroImage: "https://images.unsplash.com/photo-..."
tags: ["langchain", "deepagent", "agent", "llm", "python"]
draft: false
---
```

### 9-3. 本文を執筆する

- `##`, `###` 見出しを使うと目次が自動生成されます。
- コードブロック、GitHub風アラート、リンクカードが利用できます。
- 長文記事は「背景 → 設計 → 実装 → 評価 → まとめ」の順にすると読みやすくなります。

### 9-4. ローカル確認を行う

```bash
pnpm dev
```

確認ポイント:

- `/blog` 一覧に表示される
- `/blog/<slug>/` で本文が崩れない
- `/blog/tag/<tag>/` にタグ導線が反映される

### 9-5. 本番相当のビルド検証

```bash
pnpm build
```

このコマンドで型チェック、静的ビルド、Pagefind インデックス生成が実行されます。  
エラー時は Frontmatter 型、Markdown記法、リンク切れを優先して確認してください。

### 9-6. デプロイして反映する

```bash
pnpm deploy
```

運用の基本手順は次です。

1. `pnpm build` で事前検証
2. 問題なければ `pnpm deploy` で反映

### 9-7. 公開チェックリスト

- [ ] `draft: false` を確認
- [ ] `title` / `description` が明確
- [ ] `heroImage` の表示とURL有効性を確認（設定した場合）
- [ ] タグが適切
- [ ] `pnpm build` 成功
- [ ] `/blog` と記事詳細を最終確認

---

## 10. 関連ドキュメント

- [← セットアップガイド](./01-SETUP-GUIDE.md)
- [コンポーネント・レイアウト →](./03-COMPONENTS-LAYOUTS.md)
- [ページ実装](./04-PAGES-IMPLEMENTATION.md) - `getCollection()`と`render()`の使用例
- [トラブルシューティング](./06-TROUBLESHOOTING.md) - Content Collections関連のエラー対処
- [Content Collections - Astro Documentation](https://docs.astro.build/en/guides/content-collections/)
