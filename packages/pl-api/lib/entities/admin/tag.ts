import { z } from 'zod';

import { tagSchema } from '../tag';

/** @see {@link https://docs.joinmastodon.org/entities/Tag/#admin} */
const adminTagSchema = tagSchema.extend({
  id: z.string(),
  trendable: z.boolean(),
  usable: z.boolean(),
  requires_review: z.boolean(),
});

type AdminTag = z.infer<typeof adminTagSchema>;

export {
  adminTagSchema,
  type AdminTag,
};
