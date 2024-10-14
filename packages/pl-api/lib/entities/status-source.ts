import * as v from 'valibot';

import { locationSchema } from './location';

/** @see {@link https://docs.joinmastodon.org/entities/StatusSource/} */
const statusSourceSchema = v.object({
  id: v.string(),
  text: v.fallback(v.string(), ''),
  spoiler_text: v.fallback(v.string(), ''),

  content_type: z.string().catch('text/plain'),
  location: v.fallback(v.nullable(locationSchema), null),

  text_map: v.record(v.string(), v.string()).nullable().catch(null),
  spoiler_text_map: v.record(v.string(), v.string()).nullable().catch(null),
});

type StatusSource = v.InferOutput<typeof statusSourceSchema>;

export { statusSourceSchema, type StatusSource };
