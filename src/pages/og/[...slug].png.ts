import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';
import { renderOgImage } from '../../lib/og/render';

// 静的出力なので、各 OG 画像はビルド時に PNG として書き出される。
// - /og/default.png            … サイト共通の既定 OG 画像
// - /og/blog/<slug>.png        … 記事ごとの OG 画像
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => (import.meta.env.PROD ? !data.draft : true));

  return [
    {
      params: { slug: 'default' },
      props: { title: SITE_TITLE, subtitle: SITE_DESCRIPTION },
    },
    ...posts.map((post) => ({
      params: { slug: `blog/${post.slug}` },
      props: { title: post.data.title, subtitle: post.data.description },
    })),
  ];
};

export const GET: APIRoute = async ({ props, site }) => {
  const domain = site ? site.host : '';
  const png = await renderOgImage({
    title: String(props.title ?? SITE_TITLE),
    subtitle: typeof props.subtitle === 'string' ? props.subtitle : undefined,
    domain,
  });

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
