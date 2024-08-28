import { z } from 'zod';

const historySchema = z.object({
  day: z.coerce.number(),
  accounts: z.coerce.number(),
  uses: z.coerce.number(),
});

/** @see {@link https://docs.joinmastodon.org/entities/tag} */
const tagSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().catch(''),
  history: z.array(historySchema).nullable().catch(null),
  following: z.boolean().optional().catch(undefined),
});

type Tag = z.infer<typeof tagSchema>;

export { historySchema, tagSchema, type Tag };
