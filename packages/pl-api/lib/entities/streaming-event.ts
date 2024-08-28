import { z } from 'zod';

import { announcementSchema } from './announcement';
import { announcementReactionSchema } from './announcement-reaction';
import { chatSchema } from './chat';
import { conversationSchema } from './conversation';
import { notificationSchema } from './notification';
import { statusSchema } from './status';

const followRelationshipUpdateSchema = z.object({
  state: z.enum(['follow_pending', 'follow_accept', 'follow_reject']),
  follower: z.object({
    id: z.string(),
    follower_count: z.number().nullable().catch(null),
    following_count: z.number().nullable().catch(null),
  }),
  following: z.object({
    id: z.string(),
    follower_count: z.number().nullable().catch(null),
    following_count: z.number().nullable().catch(null),
  }),
});

type FollowRelationshipUpdate = z.infer<typeof followRelationshipUpdateSchema>;

const baseStreamingEventSchema = z.object({
  stream: z.array(z.string()).catch([]),
});

const statusStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.enum(['update', 'status.update']),
  payload: z.preprocess((payload: any) => JSON.parse(payload), statusSchema),
});

const stringStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.enum(['delete', 'announcement.delete']),
  payload: z.string(),
});

const notificationStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('notification'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), notificationSchema),
});

const emptyStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('filters_changed'),
});

const conversationStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('conversation'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), conversationSchema),
});

const announcementStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('announcement'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), announcementSchema),
});

const announcementReactionStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('announcement.reaction'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), announcementReactionSchema),
});

const chatUpdateStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('chat_update'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), chatSchema),
});

const followRelationshipsUpdateStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('follow_relationships_update'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), followRelationshipUpdateSchema),
});

const respondStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('respond'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), z.object({
    type: z.string(),
    result: z.enum(['success', 'ignored', 'error']),
  })),
});

/** @see {@link https://docs.joinmastodon.org/methods/streaming/#events} */
const streamingEventSchema: z.ZodType<StreamingEvent> = z.preprocess((event: any) => ({
  ...event,
  event: event.event?.replace(/^pleroma:/, ''),
}), z.discriminatedUnion('event', [
  statusStreamingEventSchema,
  stringStreamingEventSchema,
  notificationStreamingEventSchema,
  emptyStreamingEventSchema,
  conversationStreamingEventSchema,
  announcementStreamingEventSchema,
  announcementReactionStreamingEventSchema,
  chatUpdateStreamingEventSchema,
  followRelationshipsUpdateStreamingEventSchema,
  respondStreamingEventSchema,
])) as any;

type StreamingEvent = z.infer<
| typeof statusStreamingEventSchema
| typeof stringStreamingEventSchema
| typeof notificationStreamingEventSchema
| typeof emptyStreamingEventSchema
| typeof conversationStreamingEventSchema
| typeof announcementStreamingEventSchema
| typeof announcementReactionStreamingEventSchema
| typeof chatUpdateStreamingEventSchema
| typeof followRelationshipsUpdateStreamingEventSchema
| typeof respondStreamingEventSchema
>;

export {
  followRelationshipUpdateSchema,
  streamingEventSchema,
  type FollowRelationshipUpdate,
  type StreamingEvent,
};
