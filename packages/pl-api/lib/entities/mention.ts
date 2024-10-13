import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/Status/#Mention} */
const mentionSchema = v.object({
  id: v.string(),
  username: v.fallback(v.string(), ''),
  url: z.string().url().catch(''),
  acct: v.string(),
}).transform((mention) => {
  if (!mention.username) {
    mention.username = mention.acct.split('@')[0];
  }

  return mention;
});

type Mention = v.InferOutput<typeof mentionSchema>;

export { mentionSchema, type Mention };
