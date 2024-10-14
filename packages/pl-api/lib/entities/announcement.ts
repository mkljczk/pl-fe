import * as v from 'valibot';

import { announcementReactionSchema } from './announcement-reaction';
import { customEmojiSchema } from './custom-emoji';
import { mentionSchema } from './mention';
import { tagSchema } from './tag';
import { dateSchema, filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/announcement/} */
const announcementSchema = v.object({
  id: v.string(),
  content: v.fallback(v.string(), ''),
  starts_at: v.fallback(v.nullable(z.string().datetime()), null),
  ends_at: v.fallback(v.nullable(z.string().datetime()), null),
  all_day: v.fallback(v.boolean(), false),
  read: v.fallback(v.boolean(), false),
  published_at: dateSchema,
  reactions: filteredArray(announcementReactionSchema),
  statuses: z.preprocess(
    (statuses: any) => Array.isArray(statuses)
      ? Object.fromEntries(statuses.map((status: any) => [status.url, status.account?.acct]) || [])
      : statuses,
    v.record(v.string(), v.string(), v.string()),
  ),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  updated_at: dateSchema,
});

type Announcement = v.InferOutput<typeof announcementSchema>;

export { announcementSchema, type Announcement };
