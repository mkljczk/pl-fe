import pick from 'lodash.pick';
import * as v from 'valibot';

import { accountSchema } from './account';
import { accountWarningSchema } from './account-warning';
import { chatMessageSchema } from './chat-message';
import { relationshipSeveranceEventSchema } from './relationship-severance-event';
import { reportSchema } from './report';
import { statusSchema } from './status';
import { dateSchema } from './utils';

const baseNotificationSchema = v.object({
  account: accountSchema,
  created_at: dateSchema,
  id: v.string(),
  group_key: v.string(),
  type: v.string(),

  is_muted: v.fallback(v.optional(v.boolean()), undefined),
  is_seen: v.fallback(v.optional(v.boolean()), undefined),
});

const accountNotificationSchema = baseNotificationSchema.extend({
  type: z.enum(['follow', 'follow_request', 'admin.sign_up', 'bite']),
});

const mentionNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('mention'),
  subtype: z.enum(['reply']).nullable().catch(null),
  status: statusSchema,
});

const statusNotificationSchema = baseNotificationSchema.extend({
  type: z.enum(['status', 'reblog', 'favourite', 'poll', 'update', 'event_reminder']),
  status: statusSchema,
});

const reportNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('admin.report'),
  report: reportSchema,
});

const severedRelationshipNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('severed_relationships'),
  relationship_severance_event: relationshipSeveranceEventSchema,
});

const moderationWarningNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('moderation_warning'),
  moderation_warning: accountWarningSchema,
});

const moveNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('move'),
  target: accountSchema,
});

const emojiReactionNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('emoji_reaction'),
  emoji: v.string(),
  emoji_url: v.fallback(v.nullable(v.string()), null),
  status: statusSchema,
});

const chatMentionNotificationSchema = baseNotificationSchema.extend({
  type: z.literal('chat_mention'),
  chat_message: chatMessageSchema,
});

const eventParticipationRequestNotificationSchema = baseNotificationSchema.extend({
  type: z.enum(['participation_accepted', 'participation_request']),
  status: statusSchema,
  participation_message: v.fallback(v.nullable(v.string()), null),
});

/** @see {@link https://docs.joinmastodon.org/entities/Notification/} */
const notificationSchema: z.ZodType<Notification> = z.preprocess((notification: any) => ({
  group_key: `ungrouped-${notification.id}`,
  ...pick(notification.pleroma || {}, ['is_muted', 'is_seen']),
  ...notification,
  type: notification.type === 'pleroma:report'
    ? 'admin.report'
    : notification.type?.replace(/^pleroma:/, ''),
}), z.discriminatedUnion('type', [
  accountNotificationSchema,
  mentionNotificationSchema,
  statusNotificationSchema,
  reportNotificationSchema,
  severedRelationshipNotificationSchema,
  moderationWarningNotificationSchema,
  moveNotificationSchema,
  emojiReactionNotificationSchema,
  chatMentionNotificationSchema,
  eventParticipationRequestNotificationSchema,
])) as any;

type Notification = v.InferOutput<
| typeof accountNotificationSchema
| typeof mentionNotificationSchema
| typeof statusNotificationSchema
| typeof reportNotificationSchema
| typeof severedRelationshipNotificationSchema
| typeof moderationWarningNotificationSchema
| typeof moveNotificationSchema
| typeof emojiReactionNotificationSchema
| typeof chatMentionNotificationSchema
| typeof eventParticipationRequestNotificationSchema
>;

export { notificationSchema, type Notification };
