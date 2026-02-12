import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true));

  return rss({
    title: 'Signal & Sprocket',
    description: 'Astro実装の知見を記録する技術ブログ',
    site: context.site ?? 'https://example.com',
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.slug}/`,
      })),
    customData: '<language>ja-jp</language>',
  });
}
