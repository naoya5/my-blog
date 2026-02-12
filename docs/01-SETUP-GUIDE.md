# セットアップガイド

このドキュメントでは、Astroを使用したブログプロジェクトの初期セットアップ手順、必要な依存関係、および設定ファイルの詳細について説明します。

## 目次

- [1. 前提条件](#1-前提条件)
- [2. プロジェクトの作成](#2-プロジェクトの作成)
- [3. 依存関係のインストール](#3-依存関係のインストール)
- [4. 設定ファイル](#4-設定ファイル)
- [5. ディレクトリ構造の作成](#5-ディレクトリ構造の作成)
- [6. 開発サーバーの起動](#6-開発サーバーの起動)
- [7. 推奨VS Code拡張機能](#7-推奨vs-code拡張機能)
- [8. セットアップ確認](#8-セットアップ確認)
- [9. 次のステップ](#9-次のステップ)
- [10. 関連ドキュメント](#10-関連ドキュメント)

---

## 1. 前提条件

プロジェクトを開始する前に、以下の環境が整っていることを確認してください。

- **Node.js**: `v18.17.1` 以上
- **pnpm**: `9.x` 以上（推奨パッケージマネージャー）

### pnpmのインストール

pnpmがインストールされていない場合は、以下のコマンドでインストールしてください。

```bash
# npmでインストール
npm install -g pnpm

# または Corepack を使用（Node.js 16.13+）
corepack enable
corepack prepare pnpm@latest --activate

# インストール確認
pnpm --version
```

## 2. プロジェクトの作成

以下のコマンドを実行して、新しいAstroプロジェクトを作成します。

```bash
pnpm create astro@latest
```

対話形式のプロンプトでは、以下の設定を推奨します：
- **Where would you like to create your new project?**: `./` (または任意のディレクトリ名)
- **How would you like to start your new project?**: `Empty` (クリーンな状態から開始)
- **Install dependencies?**: `Yes`
- **Do you plan to write TypeScript?**: `Yes`
- **How strict should TypeScript be?**: `Strict`
- **Initialize a new git repository?**: `Yes`

## 3. 依存関係のインストール

プロジェクトに必要な統合機能とライブラリをインストールします。

```bash
# Astro公式統合機能の追加
pnpm astro add tailwind sitemap cloudflare

# その他の依存関係のインストール
pnpm add @astrojs/rss reading-time

# Markdownプラグイン（リンクカード、アラートブロック）
pnpm add remark-link-card-plus remark-github-blockquote-alert

# Shiki Transformers（行ハイライト、Diff対応）
pnpm add @shikijs/transformers

# 開発用依存関係のインストール
pnpm add -D @tailwindcss/typography rehype-autolink-headings rehype-slug wrangler
```

## 4. 設定ファイル

プロジェクトの動作を定義する主要な設定ファイルの内容です。

### astro.config.mjs

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
    shikiConfig: {
      themes: { 
        light: 'github-light', 
        dark: 'github-dark-dimmed' 
      },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationDiff(),      // [!code ++] / [!code --]
        transformerNotationHighlight(), // [!code highlight]
        transformerMetaHighlight(),     // {1,3-5}
      ],
    },
    remarkPlugins: [
      [remarkLinkCard, { cache: true, shortenUrl: true }],
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: { className: ['anchor-link'] },
      }],
    ],
  },
  build: { inlineStylesheets: 'auto' },
});
```

### tailwind.config.cjs

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray.700'),
            '--tw-prose-headings': theme('colors.gray.900'),
            '--tw-prose-links': theme('colors.blue.600'),
            '--tw-prose-bold': theme('colors.gray.900'),
            '--tw-prose-code': theme('colors.pink.600'),
            '--tw-prose-quotes': theme('colors.gray.900'),
            'a': {
              'text-decoration': 'none',
              '&:hover': {
                'text-decoration': 'underline',
              },
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@assets/*": ["src/assets/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

### package.json (完成形イメージ)

```json
{
  "name": "astro-blog",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "deploy": "astro build && wrangler pages deploy ./dist",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/cloudflare": "^12.0.0",
    "@astrojs/rss": "^4.0.9",
    "@astrojs/sitemap": "^3.2.1",
    "@astrojs/tailwind": "^5.1.2",
    "@shikijs/transformers": "^1.0.0",
    "astro": "^5.0.5",
    "reading-time": "^1.5.0",
    "remark-github-blockquote-alert": "^1.0.0",
    "remark-link-card-plus": "^0.7.0",
    "tailwindcss": "^3.4.17"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "@tailwindcss/typography": "^0.5.16",
    "rehype-autolink-headings": "^7.1.0",
    "rehype-slug": "^6.0.0",
    "typescript": "^5.7.2",
    "wrangler": "^3.0.0"
  }
}
```

### wrangler.jsonc (Cloudflare設定)

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "astro-blog",
  "compatibility_date": "2026-01-29",
  "pages_build_output_dir": "./dist"
}
```

### src/styles/global.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* GitHub風アラートブロックのスタイル */
@import 'remark-github-blockquote-alert/alert.css';

@layer base {
  :root {
    --font-sans: 'Inter', system-ui, sans-serif;
  }
  
  html {
    font-family: var(--font-sans);
    scroll-behavior: smooth;
  }

  body {
    @apply bg-white text-gray-900 antialiased transition-colors duration-300;
  }

  body.dark {
    @apply bg-gray-900 text-gray-100;
  }
}

@layer components {
  .anchor-link {
    @apply ml-2 opacity-0 transition-opacity duration-200;
  }
  
  h1:hover .anchor-link,
  h2:hover .anchor-link,
  h3:hover .anchor-link {
    @apply opacity-100;
  }

  /* リンクカードのスタイル */
  .remark-link-card-plus__card {
    @apply flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden no-underline text-inherit transition-shadow duration-200;
  }

  .remark-link-card-plus__card:hover {
    @apply shadow-lg;
  }

  .remark-link-card-plus__main {
    @apply flex-1 p-4;
  }

  .remark-link-card-plus__title {
    @apply text-base font-bold mb-2 line-clamp-2;
  }

  .remark-link-card-plus__description {
    @apply text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2;
  }

  .remark-link-card-plus__meta {
    @apply flex items-center gap-2 text-xs text-gray-500;
  }

  .remark-link-card-plus__thumbnail {
    @apply w-48 flex-shrink-0;
  }

  .remark-link-card-plus__image {
    @apply w-full h-full object-cover;
  }

  /* Shiki行ハイライト・Diffスタイル */
  .astro-code .highlighted {
    @apply bg-yellow-500/10;
  }

  .astro-code .diff.add {
    @apply bg-green-500/20;
  }

  .astro-code .diff.remove {
    @apply bg-red-500/20;
  }
}

/* ダークモードでShikiテーマ切り替え */
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

## 5. ディレクトリ構造の作成

プロジェクトに必要なディレクトリを事前に作成します。

```bash
mkdir -p src/components/layout
mkdir -p src/components/blog
mkdir -p src/components/ui
mkdir -p src/content/blog
mkdir -p src/layouts
mkdir -p src/utils
mkdir -p src/assets/blog
mkdir -p public/images
```

## 6. 開発サーバーの起動

以下のコマンドで開発サーバーを起動し、ブラウザで確認します。

```bash
# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# ビルド結果のプレビュー
pnpm preview

# Cloudflare Pagesへデプロイ
pnpm deploy
```

デフォルトでは `http://localhost:4321` でアクセス可能です。

## 7. 推奨VS Code拡張機能

開発効率を向上させるために、以下の拡張機能のインストールを推奨します。

- **Astro**: Astroコンポーネントの構文ハイライトとインテリセンス
- **Tailwind CSS IntelliSense**: Tailwindクラスの補完
- **Prettier**: コードの自動整形
- **ESLint**: 静的解析

## 8. セットアップ確認

セットアップが正しく完了したか、以下の点を確認してください。

1. `pnpm dev` でエラーなくサーバーが起動すること
2. `astro.config.mjs` に Tailwind, Sitemap, Cloudflare が登録されていること
3. `src/styles/global.css` が作成され、Tailwindのディレクティブが含まれていること
4. `wrangler.jsonc` が作成されていること
5. Markdownファイルでリンクカード・アラートブロックが動作すること

## 9. 次のステップ

セットアップが完了したら、次はコンテンツの管理方法について学びましょう。

- [Content Collectionsの実装](./02-CONTENT-COLLECTIONS.md)

## 10. 関連ドキュメント

- [← プロジェクト概要](./00-PROJECT-OVERVIEW.md)
- [Content Collections の設定 →](./02-CONTENT-COLLECTIONS.md)
- [Markdownプラグイン](./08-MARKDOWN-PLUGINS.md) - リンクカード・アラートブロックの詳細
- [トラブルシューティング](./06-TROUBLESHOOTING.md) - セットアップ時のエラー対処
- [Astro Installation Guide](https://docs.astro.build/en/install/auto/)
- [Tailwind CSS Integration](https://docs.astro.build/en/guides/integrations-guide/tailwind/)
- [Cloudflare Adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [pnpm公式ドキュメント](https://pnpm.io/)
