# コンポーネントとレイアウトの実装ガイド

このドキュメントでは、Astroブログの基盤となるレイアウトと、再利用可能なコンポーネントの実装方法について詳しく解説します。

## 目次

1. [ディレクトリ構造](#ディレクトリ構造)
2. [BaseLayout: 基盤レイアウト](#baselayout-基盤レイアウト)
3. [BaseHead: SEOとメタタグ](#basehead-seoとメタタグ)
4. [Header & Footer: ナビゲーション](#header--footer-ナビゲーション)
5. [ThemeToggle: ダークモード実装](#themetoggle-ダークモード実装)
6. [BlogCard: 記事カード](#blogcard-記事カード)
7. [ReadingTime: 読了時間](#readingtime-読了時間)
8. [Tag: タグ表示](#tag-タグ表示)
9. [TableOfContents: 目次生成](#tableofcontents-目次生成)
10. [Tailwind CSSのカスタマイズ](#tailwind-cssのカスタマイズ)
11. [Props型定義のベストプラクティス](#props型定義のベストプラクティス)
12. [関連ドキュメント](#12-関連ドキュメント)

---

## ディレクトリ構造

コンポーネントは役割ごとにディレクトリを分けて管理することで、保守性を高めます。

```text
src/
├── layouts/
│   └── BaseLayout.astro      # すべてのページの基盤となるレイアウト
├── components/
│   ├── layout/               # 共通レイアウトパーツ
│   │   ├── BaseHead.astro    # <head> 内のメタタグ
│   │   ├── Header.astro      # ヘッダー
│   │   ├── Footer.astro      # フッター
│   │   └── ThemeToggle.astro # ダークモード切り替え
│   ├── blog/                 # ブログ関連コンポーネント
│   │   ├── BlogCard.astro    # 記事一覧のカード
│   │   ├── ReadingTime.astro # 読了時間表示
│   │   └── TableOfContents.astro # 記事の目次
│   └── ui/                   # 汎用UIパーツ
│       └── Tag.astro         # タグバッジ
└── styles/
    └── global.css            # グローバルスタイル
```

---

## BaseLayout: 基盤レイアウト

`BaseLayout` は、すべてのページで共通して使用される HTML 構造を定義します。`<slot />` を使用して、各ページ固有のコンテンツを挿入します。

### 実装例 (`src/layouts/BaseLayout.astro`)

```astro
---
import BaseHead from '../components/layout/BaseHead.astro';
import Header from '../components/layout/Header.astro';
import Footer from '../components/layout/Footer.astro';

interface Props {
  title: string;
  description?: string;
  image?: string;
}

const { title, description, image } = Astro.props;
---

<!doctype html>
<html lang="ja">
  <head>
    <BaseHead title={title} description={description} image={image} />
  </head>
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
    <div class="flex flex-col min-h-screen">
      <Header />
      <main class="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <slot />
      </main>
      <Footer />
    </div>
  </body>
</html>
```

---

## BaseHead: SEOとメタタグ

`BaseHead` は、SEO、ソーシャルメディア共有（OGP）、ファビコンなどの設定を管理します。

### 実装例 (`src/components/layout/BaseHead.astro`)

```astro
---
interface Props {
  title: string;
  description?: string;
  image?: string;
}

const canonicalURL = new URL(Astro.url.pathname, Astro.site);
const { title, description = "Astroで作られたモダンなブログ", image = "/og-image.png" } = Astro.props;
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="generator" content={Astro.generator} />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalURL} />

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.url)} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={Astro.url} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={new URL(image, Astro.url)} />
```

---

## Header & Footer: ナビゲーション

サイト全体のナビゲーションを提供します。

### Header 実装例 (`src/components/layout/Header.astro`)

```astro
---
import ThemeToggle from './ThemeToggle.astro';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];
---

<header class="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50">
  <nav class="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
    <a href="/" class="text-xl font-bold hover:text-primary transition-colors">
      MyBlog
    </a>
    <div class="flex items-center gap-6">
      <ul class="flex gap-4">
        {navItems.map(item => (
          <li>
            <a href={item.href} class="hover:text-primary transition-colors">
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <ThemeToggle />
    </div>
  </nav>
</header>
```

### Footer 実装例 (`src/components/layout/Footer.astro`)

```astro
---
const today = new Date();
---

<footer class="border-t border-gray-200 dark:border-gray-800 py-8 mt-auto">
  <div class="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400 max-w-4xl">
    &copy; {today.getFullYear()} MyBlog. All rights reserved.
  </div>
</footer>
```

---

## ThemeToggle: ダークモード実装

ダークモードの切り替えには、`localStorage` を使用してユーザーの好みを保存し、ページ読み込み時に適用する JavaScript ロジックが必要です。

### 実装例 (`src/components/layout/ThemeToggle.astro`)

```astro
---
---
<button
  id="theme-toggle"
  class="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:ring-2 ring-gray-300 transition-all"
  aria-label="Toggle Dark Mode"
>
  <span class="sun hidden dark:inline">🌞</span>
  <span class="moon inline dark:hidden">🌙</span>
</button>

<script>
  const theme = (() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme');
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();

  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }

  window.localStorage.setItem('theme', theme || 'light');

  const handleToggleClick = () => {
    const element = document.documentElement;
    element.classList.toggle("dark");

    const isDark = element.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  document.getElementById("theme-toggle")?.addEventListener("click", handleToggleClick);
</script>
```

---

## BlogCard: 記事カード

ブログ一覧ページで使用する、個々の記事のプレビューを表示するコンポーネントです。

### 実装例 (`src/components/blog/BlogCard.astro`)

```astro
---
import { Image } from 'astro:assets';
import Tag from '../ui/Tag.astro';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  url: string;
  image?: string;
  tags?: string[];
}

const { title, description, pubDate, url, image, tags = [] } = Astro.props;
---

<article class="group border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white dark:bg-gray-900">
  <a href={url} class="block">
    {image && (
      <div class="aspect-video overflow-hidden">
        <img
          src={image}
          alt={title}
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
    )}
    <div class="p-6">
      <time datetime={pubDate.toISOString()} class="text-sm text-gray-500 dark:text-gray-400">
        {pubDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
      </time>
      <h2 class="text-xl font-bold mt-2 group-hover:text-primary transition-colors">
        {title}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
        {description}
      </p>
      <div class="flex flex-wrap gap-2 mt-4">
        {tags.map(tag => <Tag name={tag} />)}
      </div>
    </div>
  </a>
</article>
```

---

## ReadingTime: 読了時間

記事の文字数から推定読了時間を計算して表示します。`reading-time` ライブラリを使用する例です。

### 実装例 (`src/components/blog/ReadingTime.astro`)

```astro
---
import readingTime from 'reading-time';

interface Props {
  content: string;
}

const { content } = Astro.props;
const stats = readingTime(content);
---

<span class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  {Math.ceil(stats.minutes)} 分で読めます
</span>
```

---

## Tag: タグ表示

記事に紐づくタグを表示するための小さなバッジコンポーネントです。

### 実装例 (`src/components/ui/Tag.astro`)

```astro
---
interface Props {
  name: string;
}

const { name } = Astro.props;
---

<a
  href={`/blog/tag/${name}`}
  class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-primary hover:text-white transition-colors"
>
  #{name}
</a>
```

---

## TableOfContents: 目次生成

Markdownのヘッダー（h2, h3など）から目次を自動生成します。

### 実装例 (`src/components/blog/TableOfContents.astro`)

```astro
---
interface Props {
  headings: { depth: number; slug: string; text: string }[];
}

const { headings } = Astro.props;
const filteredHeadings = headings.filter((h) => h.depth <= 3);
---

{filteredHeadings.length > 0 && (
  <nav class="toc p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
    <h2 class="text-lg font-bold mb-4">目次</h2>
    <ul class="space-y-2">
      {filteredHeadings.map((heading) => (
        <li class={heading.depth === 3 ? "ml-4" : ""}>
          <a
            href={`#${heading.slug}`}
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  </nav>
)}
```

---

## Tailwind CSSのカスタマイズ

`src/styles/global.css` で、Tailwindのベーススタイルやカスタムユーティリティを定義します。

### 実装例 (`src/styles/global.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 37 99 235; /* Blue 600 */
  }

  .dark {
    --primary: 96 165 250; /* Blue 400 */
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply antialiased;
  }
}

@layer components {
  .text-primary {
    color: rgb(var(--primary));
  }
  
  .bg-primary {
    background-color: rgb(var(--primary));
  }

  /* Typography Plugin Customization */
  .prose {
    @apply max-w-none;
  }

  .prose pre {
    @apply rounded-xl border border-gray-200 dark:border-gray-800;
  }
}
```

---

## Props型定義のベストプラクティス

Astroコンポーネントでは、TypeScriptを使用してPropsの型を定義することが推奨されます。

1. **`interface Props` を使用する**: コンポーネントの冒頭で定義します。
2. **オプショナルなProps**: `?` を使用して定義し、デフォルト値を設定します。
3. **外部ライブラリの型**: 必要に応じてインポートして使用します。

```astro
---
// 例: 型安全なProps定義
interface Props {
  title: string;          // 必須
  description?: string;   // 任意
  count: number;          // 数値
  tags: string[];         // 配列
}

const { title, description = "デフォルト説明", count, tags } = Astro.props;
---
```

---

## 12. 関連ドキュメント

- [← Content Collections](./02-CONTENT-COLLECTIONS.md)
- [ページ実装 →](./04-PAGES-IMPLEMENTATION.md)
- [SEO・パフォーマンス](./05-SEO-PERFORMANCE.md) - BaseHeadの実装詳細
- [Astro Components](https://docs.astro.build/en/core-concepts/astro-components/)

