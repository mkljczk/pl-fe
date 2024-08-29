import { z } from 'zod';

import { announcementReactionSchema } from './announcement-reaction';
import { customEmojiSchema } from './custom-emoji';
import { mentionSchema } from './mention';
import { tagSchema } from './tag';
import { dateSchema, filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/announcement/} */
const announcementSchema = z.object({
  id: z.string(),
  content: z.string().catch(''),
  starts_at: z.string().datetime().nullable().catch(null),
  ends_at: z.string().datetime().nullable().catch(null),
  all_day: z.boolean().catch(false),
  read: z.boolean().catch(false),
  published_at: dateSchema,
  reactions: filteredArray(announcementReactionSchema),
  statuses: z.preprocess(
    (statuses: any) => Array.isArray(statuses)
      ? Object.fromEntries(statuses.map((status: any) => [status.url, status.account?.acct]) || [])
      : statuses,
    z.record(z.string(), z.string()),
  ),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  updated_at: dateSchema,
});

type Announcement = z.infer<typeof announcementSchema>;

export { announcementSchema, type Announcement };
