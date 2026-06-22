import type { APIRoute } from 'astro';

// robots.txt はビルド時に Astro.site から動的生成する。
// ドメインは astro.config.mjs の `site` が単一の真実の源なので、
// ここを手で書き換える必要はない。
export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site ?? 'https://my-blog.pages.dev').toString();

  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${sitemapUrl}`, ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
