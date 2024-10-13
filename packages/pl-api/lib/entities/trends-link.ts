import * as v from 'valibot';

import { blurhashSchema } from './media-attachment';
import { historySchema } from './tag';

/** @see {@link https://docs.joinmastodon.org/entities/PreviewCard/#trends-link} */
const trendsLinkSchema = z.preprocess((link: any) => ({ ...link, id: link.url }), v.object({
  id: v.fallback(v.string(), ''),
  url: z.string().url().catch(''),
  title: v.fallback(v.string(), ''),
  description: v.fallback(v.string(), ''),
  type: z.enum(['link', 'photo', 'video', 'rich']).catch('link'),
  author_name: v.fallback(v.string(), ''),
  author_url: v.fallback(v.string(), ''),
  provider_name: v.fallback(v.string(), ''),
  provider_url: v.fallback(v.string(), ''),
  html: v.fallback(v.string(), ''),
  width: v.fallback(v.nullable(v.number()), null),
  height: v.fallback(v.nullable(v.number()), null),
  image: v.fallback(v.nullable(v.string()), null),
  image_description: v.fallback(v.nullable(v.string()), null),
  embed_url: v.fallback(v.string(), ''),
  blurhash: v.fallback(v.nullable(blurhashSchema), null),
  history: z.array(historySchema).nullable().catch(null),
}));

type TrendsLink = v.InferOutput<typeof trendsLinkSchema>;

export { trendsLinkSchema, type TrendsLink };
