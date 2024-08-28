import { z } from 'zod';

import { customEmojiSchema } from './custom-emoji';
import { filteredArray } from './utils';

const pollOptionSchema = z.object({
  title: z.string().catch(''),
  votes_count: z.number().catch(0),

  title_map: z.record(z.string()).nullable().catch(null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Poll/} */
const pollSchema = z.object({
  emojis: filteredArray(customEmojiSchema),
  expired: z.boolean().catch(false),
  expires_at: z.string().datetime().nullable().catch(null),
  id: z.string(),
  multiple: z.boolean().catch(false),
  options: z.array(pollOptionSchema).min(2),
  voters_count: z.number().catch(0),
  votes_count: z.number().catch(0),
  own_votes: z.array(z.number()).nonempty().nullable().catch(null),
  voted: z.boolean().catch(false),

  non_anonymous: z.boolean().catch(false),
});

type Poll = z.infer<typeof pollSchema>;
type PollOption = Poll['options'][number];

export { pollSchema, type Poll, type PollOption };
