import type { CollectionEntry } from 'astro:content';

export function getRelatedPosts(currentPost: CollectionEntry<'blog'>, posts: CollectionEntry<'blog'>[], limit = 3) {
  return posts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => {
      const commonTags = post.data.tags.filter((tag) => currentPost.data.tags.includes(tag));
      return { post, score: commonTags.length };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf())
    .slice(0, limit)
    .map(({ post }) => post);
}
