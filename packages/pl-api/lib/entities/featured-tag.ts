import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/FeaturedTag/} */
const featuredTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().optional().catch(undefined),
  statuses_count: z.number(),
  last_status_at: z.number(),
});

type FeaturedTag = z.infer<typeof featuredTagSchema>;

export { featuredTagSchema, type FeaturedTag };
