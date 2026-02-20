import { defineCollection, z } from 'astro:content';

const ALLOWED_EXTERNAL_IMAGE_HOSTS = new Set(['images.unsplash.com']);

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: z
        .union([
          image(),
          z
            .string()
            .superRefine((value, ctx) => {
              let parsedUrl: URL;
              try {
                parsedUrl = new URL(value);
              } catch {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'heroImage external URL must be an absolute URL',
                });
                return;
              }

              if (parsedUrl.protocol !== 'https:') {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'heroImage URL must start with https://',
                });
              }

              const hostname = parsedUrl.hostname.toLowerCase();
              if (!ALLOWED_EXTERNAL_IMAGE_HOSTS.has(hostname)) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'heroImage URL host is not allowed',
                });
              }
            }),
        ])
        .optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog };
