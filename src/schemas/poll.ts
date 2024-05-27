import escapeTextContentForBrowser from 'escape-html';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

import emojify from 'soapbox/features/emoji';

import { customEmojiSchema } from './custom-emoji';
import { filteredArray, makeCustomEmojiMap } from './utils';

const sanitizeTitle = (text: string, emojiMap: any) => DOMPurify.sanitize(emojify(escapeTextContentForBrowser(text), emojiMap), { ALLOWED_TAGS: [] });

const pollOptionSchema = z.object({
  title: z.string().catch(''),
  title_map: z.record(z.string(), z.string()).nullable().catch(null),
  votes_count: z.number().catch(0),
});

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
  pleroma: z.object({
    non_anonymous: z.boolean().catch(false),
  }).optional().catch(undefined),
}).transform((poll) => {
  const emojiMap = makeCustomEmojiMap(poll.emojis);

  const emojifiedOptions = poll.options.map((option) => ({
    ...option,
    title_emojified: sanitizeTitle(option.title, emojiMap),
    title_map_emojified: option.title_map
      ? Object.fromEntries(Object.entries(option.title_map).map(([key, title]) => [key, sanitizeTitle(title, emojiMap)]))
      : null,
  }));

  // If the user has votes, they have certainly voted.
  if (poll.own_votes?.length) {
    poll.voted = true;
  }

  return {
    ...poll,
    options: emojifiedOptions,
  };
});

type Poll = z.infer<typeof pollSchema>;
type PollOption = Poll['options'][number];

export { pollSchema, type Poll, type PollOption };