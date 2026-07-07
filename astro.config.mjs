// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkLinkCard from 'remark-link-card-plus';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkXEmbed from './src/plugins/remark-x-embed.ts';
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
        light: 'vitesse-light',
        dark: 'vitesse-dark',
      },
      defaultColor: false,
      wrap: true,
      transformers: [
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerMetaHighlight(),
      ],
    },
    remarkPlugins: [
      remarkXEmbed,
      [remarkLinkCard, { cache: true, shortenUrl: true, thumbnailPosition: 'right' }],
      remarkAlert,
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          // 見出し全体をリンクにする wrap ではなく、末尾にアイコンを追加してホバー時のみ見せる。
          // テキストノードではなく SVG アイコンにするのは、Astro の getHeadings() が
          // ここから見出しテキストを抽出するため（テキストを足すと目次に記号が混入する）。
          behavior: 'append',
          properties: { className: ['anchor-link'], ariaLabel: 'この見出しへのリンク' },
          content: {
            type: 'element',
            tagName: 'svg',
            properties: { viewBox: '0 0 24 24', width: '14', height: '14', 'aria-hidden': 'true', focusable: 'false' },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  d: 'M9 17H7a5 5 0 010-10h2M15 7h2a5 5 0 010 10h-2M8 12h8',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '1.8',
                  'stroke-linecap': 'round',
                },
                children: [],
              },
            ],
          },
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
