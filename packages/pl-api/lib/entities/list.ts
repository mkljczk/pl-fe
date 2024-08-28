import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/List/} */
const listSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  replies_policy: z.string().optional().catch(undefined),
  exclusive: z.boolean().optional().catch(undefined),
});

type List = z.infer<typeof listSchema>;

export { listSchema, type List };
