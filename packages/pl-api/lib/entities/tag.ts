import * as v from 'valibot';

const historySchema = v.object({
  day: z.coerce.number(),
  accounts: z.coerce.number(),
  uses: z.coerce.number(),
});

/** @see {@link https://docs.joinmastodon.org/entities/tag} */
const tagSchema = v.object({
  name: z.string().min(1),
  url: z.string().url().catch(''),
  history: z.array(historySchema).nullable().catch(null),
  following: v.fallback(v.optional(v.boolean()), undefined),
});

type Tag = v.InferOutput<typeof tagSchema>;

export { historySchema, tagSchema, type Tag };
