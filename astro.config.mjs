// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkLinkCard from 'remark-link-card-plus';
import { remarkAlert } from 'remark-github-blockquote-alert';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from '@shikijs/transformers';

export default defineConfig({
  // ▼ 本番ドメインの単一の真実の源。ここを変えれば canonical / OG / sitemap /
  //   robots.txt / RSS / 構造化データのすべてに反映される。独自ドメイン設定後に差し替えること。
  site: 'https://my-blog-atw.pages.dev',
  output: 'static',
  trailingSlash: 'always',
  adapter: cloudflare({ imageService: 'passthrough' }),
  image: {
    domains: ['images.unsplash.com'],
  },
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerMetaHighlight(),
      ],
    },
    remarkPlugins: [[remarkLinkCard, { cache: true, shortenUrl: true, thumbnailPosition: 'right' }], remarkAlert],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: { className: ['anchor-link'] },
        },
      ],
    ],
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    ssr: {
      // OG 画像生成のネイティブモジュール。バンドルせず Node の require に委ねる
      //（OG エンドポイントはビルド時にプリレンダリングされるため Node 上で実行される）。
      external: ['@resvg/resvg-js'],
    },
  },
});
