import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getSortedPosts } from "../utils/getSortedPosts";

export async function GET(context: APIContext) {
  // draft 除外 + 公開日降順は getSortedPosts に集約（サイト本体と同じ並び）。
  const posts = await getSortedPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? "https://my-blog.pages.dev",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
    customData: "<language>ja-jp</language>",
  });
}
