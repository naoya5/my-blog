# Markdownプラグイン設定ガイド

このドキュメントでは、ブログのMarkdown記述を強化するプラグイン（リンクカード、アラートブロック、コードハイライト）の設定と使用方法について説明します。

## 目次

1. [リンクカード（remark-link-card-plus）](#リンクカードremark-link-card-plus)
2. [アラートブロック（remark-github-blockquote-alert）](#アラートブロックremark-github-blockquote-alert)
3. [コードハイライト（Shiki + Transformers）](#コードハイライトshiki--transformers)
4. [astro.config.mjs 完全設定例](#astroconfigmjs-完全設定例)
5. [スタイリング](#スタイリング)
6. [関連ドキュメント](#関連ドキュメント)

---

## リンクカード（remark-link-card-plus）

URLを自動的にリッチなOGPカードに変換するプラグインです。

### インストール

```bash
pnpm add remark-link-card-plus
```

### 設定

```javascript
// astro.config.mjs
import remarkLinkCard from 'remark-link-card-plus';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkLinkCard, {
        cache: true,        // ビルド高速化のためキャッシュ有効化
        shortenUrl: true,   // URLを短縮表示
        thumbnailPosition: "right",  // サムネイル位置
      }],
    ],
  },
});
```

### 使用方法

Markdownファイル内で、**単独行のベアリンク**がカードに変換されます。

```markdown
# 記事タイトル

参考記事はこちら：

https://github.com

↑ 自動でリンクカードに変換！

通常のリンクはそのまま: [GitHub](https://github.com)

リスト内のリンクは変換されない:
- https://example.com
```

### 出力例

変換後は以下のようなHTMLが生成されます：

```html
<div class="remark-link-card-plus__container">
  <a href="https://github.com/" class="remark-link-card-plus__card">
    <div class="remark-link-card-plus__main">
      <div class="remark-link-card-plus__title">GitHub</div>
      <div class="remark-link-card-plus__description">説明文...</div>
      <div class="remark-link-card-plus__meta">
        <img src="[favicon]" class="remark-link-card-plus__favicon" />
        <span class="remark-link-card-plus__url">github.com</span>
      </div>
    </div>
    <div class="remark-link-card-plus__thumbnail">
      <img src="[OG画像]" />
    </div>
  </a>
</div>
```

---

## アラートブロック（remark-github-blockquote-alert）

GitHub風のアラートブロック（NOTE, WARNING, TIP等）を実装します。

### インストール

```bash
pnpm add remark-github-blockquote-alert
```

### 設定

```javascript
// astro.config.mjs
import { remarkAlert } from 'remark-github-blockquote-alert';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkAlert,
    ],
  },
});
```

### CSSのインポート

```css
/* src/styles/global.css */
@import 'remark-github-blockquote-alert/alert.css';
```

### 使用方法

```markdown
> [!NOTE]  
> ユーザーが知っておくべき有用な情報です。

> [!TIP]  
> より良い方法や簡単なやり方のヒントです。

> [!IMPORTANT]  
> 目標達成のために必要な重要情報です。

> [!WARNING]  
> 問題を避けるために注意が必要な情報です。

> [!CAUTION]  
> 特定の操作のリスクや悪影響についての警告です。
```

### 出力例

```html
<div class="markdown-alert markdown-alert-note">
  <p class="markdown-alert-title">
    <svg>...</svg> NOTE
  </p>
  <p>ユーザーが知っておくべき有用な情報です。</p>
</div>
```

### 注意点

- 各行の末尾に**2スペース**を入れると改行されます
- `remark-breaks`を併用すると自動改行になります

---

## コードハイライト（Shiki + Transformers）

Astroのビルトイン Shiki に Transformers を追加し、高度なコードハイライト機能を実現します。

### インストール

```bash
pnpm add @shikijs/transformers
```

### 設定

```javascript
// astro.config.mjs
import { 
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerMetaHighlight,
} from '@shikijs/transformers';

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: { 
        light: 'github-light', 
        dark: 'github-dark-dimmed' 
      },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationDiff(),      // Diff記法
        transformerNotationHighlight(), // 行ハイライト記法
        transformerMetaHighlight(),     // メタ文字列ハイライト
      ],
    },
  },
});
```

### 使用方法

#### 行ハイライト（メタ文字列）

````markdown
```js {1,3-5}
const a = 1;  // ハイライト
const b = 2;
const c = 3;  // ハイライト
const d = 4;  // ハイライト
const e = 5;  // ハイライト
```
````

#### 行ハイライト（インライン記法）

````markdown
```js
const a = 1;
const b = 2; // [!code highlight]
const c = 3;
```
````

#### Diff表示

````markdown
```js
const a = 1;
const b = 2; // [!code --]
const c = 3; // [!code ++]
```
````

### スタイリング

```css
/* src/styles/global.css */

/* 行ハイライト */
.astro-code .highlighted {
  @apply bg-yellow-500/10;
}

/* Diff - 追加行 */
.astro-code .diff.add {
  @apply bg-green-500/20;
}

/* Diff - 削除行 */
.astro-code .diff.remove {
  @apply bg-red-500/20;
}

/* ダークモード切り替え */
@media (prefers-color-scheme: dark) {
  .astro-code,
  .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
}

html.dark .astro-code,
html.dark .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
```

---

## astro.config.mjs 完全設定例

```javascript
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkLinkCard from 'remark-link-card-plus';
import { remarkAlert } from 'remark-github-blockquote-alert';
import { 
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerMetaHighlight,
} from '@shikijs/transformers';

export default defineConfig({
  site: 'https://yourdomain.com',
  output: 'static',
  adapter: cloudflare(),
  
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  
  markdown: {
    // Shiki設定
    shikiConfig: {
      themes: { 
        light: 'github-light', 
        dark: 'github-dark-dimmed' 
      },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerMetaHighlight(),
      ],
    },
    
    // Remarkプラグイン（Markdown処理）
    remarkPlugins: [
      [remarkLinkCard, { 
        cache: true, 
        shortenUrl: true,
        thumbnailPosition: 'right',
      }],
      remarkAlert,
    ],
    
    // Rehypeプラグイン（HTML処理）
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: { className: ['anchor-link'] },
      }],
    ],
  },
  
  build: { 
    inlineStylesheets: 'auto' 
  },
});
```

---

## スタイリング

### 完全なCSS設定（src/styles/global.css）

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* GitHub風アラートブロック */
@import 'remark-github-blockquote-alert/alert.css';

@layer components {
  /* リンクカード */
  .remark-link-card-plus__container {
    @apply my-6;
  }

  .remark-link-card-plus__card {
    @apply flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden no-underline text-inherit transition-shadow duration-200;
  }

  .remark-link-card-plus__card:hover {
    @apply shadow-lg;
  }

  .remark-link-card-plus__main {
    @apply flex-1 p-4 min-w-0;
  }

  .remark-link-card-plus__title {
    @apply text-base font-bold mb-2 line-clamp-2 text-gray-900 dark:text-gray-100;
  }

  .remark-link-card-plus__description {
    @apply text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2;
  }

  .remark-link-card-plus__meta {
    @apply flex items-center gap-2 text-xs text-gray-500;
  }

  .remark-link-card-plus__favicon {
    @apply w-4 h-4;
  }

  .remark-link-card-plus__thumbnail {
    @apply w-48 flex-shrink-0 hidden sm:block;
  }

  .remark-link-card-plus__image {
    @apply w-full h-full object-cover;
  }

  /* コードハイライト */
  .astro-code {
    @apply rounded-lg p-4 my-4 overflow-x-auto;
  }

  .astro-code .highlighted {
    @apply bg-yellow-500/10 -mx-4 px-4 border-l-2 border-yellow-500;
  }

  .astro-code .diff.add {
    @apply bg-green-500/15 -mx-4 px-4 border-l-2 border-green-500;
  }

  .astro-code .diff.remove {
    @apply bg-red-500/15 -mx-4 px-4 border-l-2 border-red-500;
  }

  .astro-code .diff.add::before {
    content: '+';
    @apply text-green-500 mr-2;
  }

  .astro-code .diff.remove::before {
    content: '-';
    @apply text-red-500 mr-2;
  }
}

/* ダークモード Shiki テーマ切り替え */
@media (prefers-color-scheme: dark) {
  .astro-code,
  .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
}

html.dark .astro-code,
html.dark .astro-code span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

/* アラートブロックのダークモード調整 */
html.dark .markdown-alert {
  @apply border-opacity-50;
}

html.dark .markdown-alert-note {
  @apply bg-blue-900/20;
}

html.dark .markdown-alert-tip {
  @apply bg-green-900/20;
}

html.dark .markdown-alert-important {
  @apply bg-purple-900/20;
}

html.dark .markdown-alert-warning {
  @apply bg-yellow-900/20;
}

html.dark .markdown-alert-caution {
  @apply bg-red-900/20;
}
```

---

## 関連ドキュメント

- [← セットアップガイド](./01-SETUP-GUIDE.md)
- [プロジェクト概要](./00-PROJECT-OVERVIEW.md)
- [remark-link-card-plus](https://github.com/okaryo/remark-link-card-plus)
- [remark-github-blockquote-alert](https://github.com/jaywcjlove/remark-github-blockquote-alert)
- [@shikijs/transformers](https://shiki.style/packages/transformers)
- [Astro Syntax Highlighting](https://docs.astro.build/en/guides/syntax-highlighting/)
