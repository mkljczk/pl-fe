import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/PreviewCard/} */
const previewCardSchema = z.object({
  author_name: z.string().catch(''),
  author_url: z.string().url().catch(''),
  blurhash: z.string().nullable().catch(null),
  description: z.string().catch(''),
  embed_url: z.string().url().catch(''),
  height: z.number().catch(0),
  html: z.string().catch(''),
  image: z.string().nullable().catch(null),
  image_description: z.string().catch(''),
  provider_name: z.string().catch(''),
  provider_url: z.string().url().catch(''),
  title: z.string().catch(''),
  type: z.enum(['link', 'photo', 'video', 'rich']).catch('link'),
  url: z.string().url(),
  width: z.number().catch(0),
});

type PreviewCard = z.infer<typeof previewCardSchema>;

export { previewCardSchema, type PreviewCard };
