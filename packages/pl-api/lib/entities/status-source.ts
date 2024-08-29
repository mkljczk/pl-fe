import { z } from 'zod';

import { locationSchema } from './location';

/** @see {@link https://docs.joinmastodon.org/entities/StatusSource/} */
const statusSourceSchema = z.object({
  id: z.string(),
  text: z.string().catch(''),
  spoiler_text: z.string().catch(''),

  content_type: z.string().catch('text/plain'),
  location: locationSchema.nullable().catch(null),

  text_map: z.record(z.string()).nullable().catch(null),
  spoiler_text_map: z.record(z.string()).nullable().catch(null),
});

type StatusSource = z.infer<typeof statusSourceSchema>;

export { statusSourceSchema, type StatusSource };
