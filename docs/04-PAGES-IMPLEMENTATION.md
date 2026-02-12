# ページ実装ガイド (Pages Implementation)

Astroにおけるページルーティングの基礎から、ブログに必要な各ページ（トップ、一覧、詳細、RSS、検索）の具体的な実装方法を解説します。

## 目次

1. [ページルーティングの基礎](#1-ページルーティングの基礎)
2. [トップページ (src/pages/index.astro)](#2-トップページ-srcpagesindexastro)
3. [ブログ一覧ページ (src/pages/blog/index.astro)](#3-ブログ一覧ページ-srcpagesblogindexastro)
4. [ブログ詳細ページ (src/pages/blog/[slug].astro)](#4-ブログ詳細ページ-srcpagesblogslugastro)
5. [動的ルーティングと getStaticPaths](#5-動的ルーティングと-getstaticpaths)
6. [タグ別一覧ページ (src/pages/blog/tag/[tag].astro)](#6-タグ別一覧ページ-srcpagesblogtagtagastro)
7. [ページネーション (src/pages/blog/page/[page].astro)](#7-ページネーション-srcpagesblogpagepageastro)
8. [RSSフィード (src/pages/rss.xml.ts)](#8-rssフィード-srcpagesrssxmlts)
9. [404ページ (src/pages/404.astro)](#9-404ページ-srcpages404astro)
10. [Pagefind検索の統合](#10-pagefind検索の統合)
11. [ベストプラクティス](#11-ベストプラクティス)
12. [関連ドキュメント](#12-関連ドキュメント)

---

## 1. ページルーティングの基礎

Astroは**ファイルベースルーティング**を採用しています。`src/pages/` ディレクトリ内のファイル構造がそのままサイトのURL構造になります。

- `src/pages/index.astro` → `/`
- `src/pages/about.astro` → `/about`
- `src/pages/blog/index.astro` → `/blog`
- `src/pages/blog/[slug].astro` → `/blog/my-post` (動的ルーティング)

### サポートされるファイル形式
- `.astro`: Astroコンポーネント（HTML + コンポーネントスクリプト）
- `.md` / `.mdx`: Markdown/MDXファイル（直接ページとしてレンダリング可能）
- `.js` / `.ts`: エンドポイント（APIやRSSフィードの生成に使用）

---

## 2. トップページ (src/pages/index.astro)

トップページでは、最新の記事を数件表示し、ブログの概要を紹介します。

```astro
---
// src/pages/index.astro
import BaseLayout from '../layouts/BaseLayout.astro';
import BlogCard from '../components/blog/BlogCard.astro';
import { getCollection } from 'astro:content';

// 公開済みの記事を取得し、日付順にソートして最新3件を抽出
const allPosts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? data.draft !== true : true;
});

const latestPosts = allPosts
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 3);

const pageTitle = "ホーム | My Astro Blog";
const description = "Astroで構築された高速なブログへようこそ。最新の技術記事をお届けします。";
---

<BaseLayout title={pageTitle} description={description}>
  <section class="py-12 border-b border-gray-200 dark:border-gray-800">
    <h1 class="text-4xl font-bold mb-4">Welcome to My Blog</h1>
    <p class="text-xl text-gray-600 dark:text-gray-400">
      AstroとContent Collectionsを使用した、型安全で高速なブログサイトです。
    </p>
  </section>

  <section class="py-12">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold">最新の記事</h2>
      <a href="/blog" class="text-primary hover:underline">すべての記事を見る &rarr;</a>
    </div>
    
    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {latestPosts.map((post) => (
        <BlogCard post={post} />
      ))}
    </div>
  </section>
</BaseLayout>
```

---

## 3. ブログ一覧ページ (src/pages/blog/index.astro)

すべての記事を一覧表示するページです。

```astro
---
// src/pages/blog/index.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
import BlogCard from '../../components/blog/BlogCard.astro';
import { getCollection } from 'astro:content';

const allPosts = await getCollection('blog', ({ data }) => {
  return import.meta.env.PROD ? data.draft !== true : true;
});

// 日付順にソート
const sortedPosts = allPosts.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);

const pageTitle = "ブログ記事一覧";
---

<BaseLayout title={pageTitle}>
  <h1 class="text-3xl font-bold mb-8">{pageTitle}</h1>
  
  <div class="grid gap-8 md:grid-cols-2">
    {sortedPosts.map((post) => (
      <BlogCard post={post} />
    ))}
  </div>
</BaseLayout>
```

---

## 4. ブログ詳細ページ (src/pages/blog/[slug].astro)

動的ルーティングを使用して、個別の記事詳細を表示します。

```astro
---
// src/pages/blog/[slug].astro
import { getCollection, render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import TableOfContents from '../../components/blog/TableOfContents.astro';
import FormattedDate from '../../components/ui/FormattedDate.astro';

// 1. getStaticPaths で全記事のパスを生成
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

// 2. props から記事データを取得
const { post } = Astro.props;
const { data } = post;

// 3. 記事内容をレンダリング
const { Content, headings } = await render(post);
---

<BaseLayout title={data.title} description={data.description} image={data.heroImage}>
  <article class="prose prose-lg dark:prose-invert max-w-none">
    <div class="mb-8">
      {data.heroImage && (
        <img
          src={data.heroImage}
          alt=""
          class="rounded-xl shadow-lg mb-8 w-full object-cover aspect-video"
        />
      )}
      <div class="flex items-center gap-2 text-gray-500 mb-2">
        <FormattedDate date={data.pubDate} />
        {data.updatedDate && (
          <span class="italic">(更新日: <FormattedDate date={data.updatedDate} />)</span>
        )}
      </div>
      <h1 class="text-4xl font-bold mb-4">{data.title}</h1>
      <div class="flex flex-wrap gap-2 mb-8">
        {data.tags.map((tag) => (
          <a href={`/blog/tag/${tag}`} class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
            #{tag}
          </a>
        ))}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
      <div>
        <Content />
      </div>
      <aside class="hidden lg:block">
        <div class="sticky top-24">
          <TableOfContents headings={headings} />
        </div>
      </aside>
    </div>
  </article>
</BaseLayout>
```

---

## 5. 動的ルーティングと getStaticPaths

Astroの静的サイト生成（SSG）モードでは、動的なURL（`[slug].astro`など）を持つページは、ビルド時にどのURLを生成するかを `getStaticPaths()` 関数で指定する必要があります。

### getStaticPaths の返り値
この関数はオブジェクトの配列を返す必要があります。各オブジェクトには以下のプロパティを含めます：

- `params`: URLパラメータ（ファイル名の `[slug]` に対応する値）
- `props`: そのページコンポーネントに渡すデータ（任意）

```typescript
export async function getStaticPaths() {
  return [
    { params: { slug: 'post-1' }, props: { title: 'Post 1' } },
    { params: { slug: 'post-2' }, props: { title: 'Post 2' } },
  ];
}
```

---

## 6. タグ別一覧ページ (src/pages/blog/tag/[tag].astro)

特定のタグが付与された記事のみを表示するページです。

```astro
---
// src/pages/blog/tag/[tag].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import BlogCard from '../../../components/blog/BlogCard.astro';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  
  // 全記事からユニークなタグのリストを作成
  const uniqueTags = [...new Set(allPosts.map((post) => post.data.tags).flat())];

  return uniqueTags.map((tag) => {
    const filteredPosts = allPosts.filter((post) =>
      post.data.tags.includes(tag)
    ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
    
    return {
      params: { tag },
      props: { posts: filteredPosts },
    };
  });
}

const { tag } = Astro.params;
const { posts } = Astro.props;
---

<BaseLayout title={`タグ: ${tag}`}>
  <h1 class="text-3xl font-bold mb-8">タグ: #{tag}</h1>
  <div class="grid gap-8 md:grid-cols-2">
    {posts.map((post) => <BlogCard post={post} />)}
  </div>
</BaseLayout>
```

---

## 7. ページネーション (src/pages/blog/page/[page].astro)

大量の記事がある場合に、ページを分割して表示します。Astroの `paginate()` ヘルパーを使用します。

```astro
---
// src/pages/blog/page/[page].astro
import { getCollection } from 'astro:content';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import BlogCard from '../../../components/blog/BlogCard.astro';

export async function getStaticPaths({ paginate }) {
  const allPosts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? data.draft !== true : true;
  });
  
  const sortedPosts = allPosts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  // 1ページあたり6記事で分割
  return paginate(sortedPosts, { pageSize: 6 });
}

const { page } = Astro.props;
---

<BaseLayout title={`ブログ一覧 - ${page.currentPage}ページ目`}>
  <h1 class="text-3xl font-bold mb-8">ブログ記事一覧</h1>
  
  <div class="grid gap-8 md:grid-cols-2 mb-12">
    {page.data.map((post) => <BlogCard post={post} />)}
  </div>

  <nav class="flex justify-center gap-4">
    {page.url.prev ? <a href={page.url.prev} class="btn">前へ</a> : null}
    <span class="self-center">{page.currentPage} / {page.lastPage}</span>
    {page.url.next ? <a href={page.url.next} class="btn">次へ</a> : null}
  </nav>
</BaseLayout>
```

---

## 8. RSSフィード (src/pages/rss.xml.ts)

`@astrojs/rss` パッケージを使用して、RSSフィードを生成します。

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  return rss({
    title: 'My Astro Blog',
    description: 'Astroで構築された高速なブログのRSSフィードです。',
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>ja-jp</language>`,
  });
}
```

---

## 9. 404ページ (src/pages/404.astro)

存在しないURLにアクセスされた際のカスタムエラーページです。

```astro
---
// src/pages/404.astro
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="404 Not Found">
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <h1 class="text-6xl font-bold mb-4">404</h1>
    <p class="text-2xl mb-8">お探しのページは見つかりませんでした。</p>
    <a href="/" class="text-primary hover:underline font-bold text-lg">
      トップページに戻る
    </a>
  </div>
</BaseLayout>
```

---

## 10. Pagefind検索の統合

Pagefindは、ビルド後の静的ファイルに対してインデックスを作成する高速な検索ライブラリです。

### 手順 1: Pagefindのインストール
```bash
npm install pagefind
```

### 手順 2: 検索UIの実装
`src/components/Search.astro` を作成し、PagefindのUIを組み込みます。

```astro
<div id="search" class="ml-3"></div>

<script>
  window.addEventListener('DOMContentLoaded', (event) => {
    // @ts-ignore
    new PagefindUI({ element: "#search", showSubResults: true });
  });
</script>

<link href="/_pagefind/pagefind-ui.css" rel="stylesheet">
<script src="/_pagefind/pagefind-ui.js" is:inline></script>
```

### 手順 3: ビルド設定
`package.json` のビルドスクリプトを修正し、ビルド後にPagefindを実行するようにします。

```json
"scripts": {
  "build": "astro build && pagefind --site dist"
}
```

---

## 11. ベストプラクティス

- **下書き機能の活用**: `getCollection` のフィルタリングで `draft: true` の記事を除外するようにします。
- **画像の最適化**: `astro:assets` を使用して、適切なサイズと形式（WebP等）で画像を表示します。
- **末尾スラッグの統一**: URLの末尾に `/` を付けるか付けないかを `astro.config.mjs` の `trailingSlash` 設定で統一します。
- **静的パスのキャッシュ**: `getStaticPaths` 内で重い処理を行う場合は、必要に応じて結果をキャッシュすることを検討してください。

---

## 12. 関連ドキュメント

- [← コンポーネント・レイアウト](./03-COMPONENTS-LAYOUTS.md)
- [SEO・パフォーマンス →](./05-SEO-PERFORMANCE.md)
- [Content Collections](./02-CONTENT-COLLECTIONS.md) - `getCollection()`の基本
- [トラブルシューティング](./06-TROUBLESHOOTING.md) - ルーティング関連のエラー対処
- [Astro Routing Guide](https://docs.astro.build/en/guides/routing/)
