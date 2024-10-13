import pick from 'lodash.pick';
import * as v from 'valibot';

import { accountSchema } from './account';
import { customEmojiSchema } from './custom-emoji';
import { emojiReactionSchema } from './emoji-reaction';
import { filterResultSchema } from './filter-result';
import { groupSchema } from './group';
import { interactionPolicySchema } from './interaction-policy';
import { mediaAttachmentSchema } from './media-attachment';
import { mentionSchema } from './mention';
import { pollSchema } from './poll';
import { previewCardSchema } from './preview-card';
import { tagSchema } from './tag';
import { translationSchema } from './translation';
import { dateSchema, filteredArray } from './utils';

const statusEventSchema = v.object({
  name: v.fallback(v.string(), ''),
  start_time: z.string().datetime().nullable().catch(null),
  end_time: z.string().datetime().nullable().catch(null),
  join_mode: z.enum(['free', 'restricted', 'invite']).nullable().catch(null),
  participants_count: v.fallback(v.number(), 0),
  location: v.object({
    name: v.fallback(v.string(), ''),
    url: z.string().url().catch(''),
    latitude: v.fallback(v.number(), 0),
    longitude: v.fallback(v.number(), 0),
    street: v.fallback(v.string(), ''),
    postal_code: v.fallback(v.string(), ''),
    locality: v.fallback(v.string(), ''),
    region: v.fallback(v.string(), ''),
    country: v.fallback(v.string(), ''),
  }).nullable().catch(null),
  join_state: z.enum(['pending', 'reject', 'accept']).nullable().catch(null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Status/} */
const baseStatusSchema = v.object({
  id: v.string(),
  uri: z.string().url().catch(''),
  created_at: dateSchema,
  account: accountSchema,
  content: v.fallback(v.string(), ''),
  visibility: z.string().catch('public'),
  sensitive: z.coerce.boolean(),
  spoiler_text: v.fallback(v.string(), ''),
  media_attachments: filteredArray(mediaAttachmentSchema),
  application: v.object({
    name: v.string(),
    website: z.string().url().nullable().catch(null),
  }).nullable().catch(null),
  mentions: filteredArray(mentionSchema),
  tags: filteredArray(tagSchema),
  emojis: filteredArray(customEmojiSchema),
  reblogs_count: v.fallback(v.number(), 0),
  favourites_count: v.fallback(v.number(), 0),
  replies_count: v.fallback(v.number(), 0),
  url: z.string().url().catch(''),
  in_reply_to_id: v.fallback(v.nullable(v.string()), null),
  in_reply_to_account_id: v.fallback(v.nullable(v.string()), null),
  poll: v.fallback(v.nullable(pollSchema), null),
  card: v.fallback(v.nullable(previewCardSchema), null),
  language: v.fallback(v.nullable(v.string()), null),
  text: v.fallback(v.nullable(v.string()), null),
  edited_at: z.string().datetime().nullable().catch(null),
  favourited: z.coerce.boolean(),
  reblogged: z.coerce.boolean(),
  muted: z.coerce.boolean(),
  bookmarked: z.coerce.boolean(),
  pinned: z.coerce.boolean(),
  filtered: filteredArray(filterResultSchema),
  approval_status: z.enum(['pending', 'approval', 'rejected']).nullable().catch(null),
  group: v.fallback(v.nullable(groupSchema), null),
  scheduled_at: z.null().catch(null),

  quote_id: v.fallback(v.nullable(v.string()), null),
  local: v.fallback(v.optional(v.boolean()), undefined),
  conversation_id: v.fallback(v.optional(v.string()), undefined),
  direct_conversation_id: v.fallback(v.optional(v.string()), undefined),
  in_reply_to_account_acct: v.fallback(v.optional(v.string()), undefined),
  expires_at: z.string().datetime({ offset: true }).optional().catch(undefined),
  thread_muted: v.fallback(v.optional(v.boolean()), undefined),
  emoji_reactions: filteredArray(emojiReactionSchema),
  parent_visible: v.fallback(v.optional(v.boolean()), undefined),
  pinned_at: z.string().datetime({ offset: true }).nullable().catch(null),
  quote_visible: v.fallback(v.optional(v.boolean()), undefined),
  quote_url: v.fallback(v.optional(v.string()), undefined),
  quotes_count: v.fallback(v.number(), 0),
  bookmark_folder: v.fallback(v.nullable(v.string()), null),

  event: v.fallback(v.nullable(statusEventSchema), null),
  translation: translationSchema.nullable().or(z.literal(false)).catch(null),

  content_map: z.record(v.string()).nullable().catch(null),
  text_map: z.record(v.string()).nullable().catch(null),
  spoiler_text_map: z.record(v.string()).nullable().catch(null),

  dislikes_count: v.fallback(v.number(), 0),
  disliked: z.coerce.boolean().catch(false),

  interaction_policy: interactionPolicySchema,
});

const preprocess = (status: any) => {
  if (!status) return null;
  status = {
    // @ts-ignore
    ...(pick(status.pleroma || {}, [
      'quote',
      'quote_id',
      'local',
      'conversation_id',
      'direct_conversation_id',
      'in_reply_to_account_acct',
      'expires_at',
      'thread_muted',
      'emoji_reactions',
      'parent_visible',
      'pinned_at',
      'quotes_count',
      'bookmark_folder',

      'event',
      'translation',
    ])),
    ...(pick(status.friendica || {}, [
      'dislikes_count',
      'disliked',
    ])),
    ...status,
  };

  return status;
};

const statusSchema: z.ZodType<Status> = z.preprocess(preprocess, baseStatusSchema.extend({
  reblog: z.lazy(() => statusSchema).nullable().catch(null),

  quote: z.lazy(() => statusSchema).nullable().catch(null),
})) as any;

const statusWithoutAccountSchema = z.preprocess(preprocess, baseStatusSchema.omit({ account: true }).extend({
  account: v.fallback(v.nullable(accountSchema), null),
  reblog: z.lazy(() => statusSchema).nullable().catch(null),

  quote: z.lazy(() => statusSchema).nullable().catch(null),
}));

type Status = v.InferOutput<typeof baseStatusSchema> & {
  reblog: Status | null;
  quote: Status | null;
}

export { statusSchema, statusWithoutAccountSchema, type Status };
