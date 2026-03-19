import { getCollection } from "astro:content";

export async function getSortedPosts() {
  const posts = await getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );

  return posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export async function getPostsByCategory(category: "deep-dive" | "daily") {
  const posts = await getSortedPosts();
  return posts.filter((post) => post.data.category === category);
}
