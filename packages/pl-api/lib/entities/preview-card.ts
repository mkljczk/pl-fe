import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/PreviewCard/} */
const previewCardSchema = v.object({
  author_name: v.fallback(v.string(), ''),
  author_url: z.string().url().catch(''),
  blurhash: v.fallback(v.nullable(v.string()), null),
  description: v.fallback(v.string(), ''),
  embed_url: z.string().url().catch(''),
  height: v.fallback(v.number(), 0),
  html: v.fallback(v.string(), ''),
  image: v.fallback(v.nullable(v.string()), null),
  image_description: v.fallback(v.string(), ''),
  provider_name: v.fallback(v.string(), ''),
  provider_url: z.string().url().catch(''),
  title: v.fallback(v.string(), ''),
  type: z.enum(['link', 'photo', 'video', 'rich']).catch('link'),
  url: z.string().url(),
  width: v.fallback(v.number(), 0),
});

type PreviewCard = v.InferOutput<typeof previewCardSchema>;

export { previewCardSchema, type PreviewCard };
