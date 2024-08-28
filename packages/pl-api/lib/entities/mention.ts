import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/Status/#Mention} */
const mentionSchema = z.object({
  id: z.string(),
  username: z.string().catch(''),
  url: z.string().url().catch(''),
  acct: z.string(),
}).transform((mention) => {
  if (!mention.username) {
    mention.username = mention.acct.split('@')[0];
  }

  return mention;
});

type Mention = z.infer<typeof mentionSchema>;

export { mentionSchema, type Mention };
