import * as v from 'valibot';

import { announcementSchema } from './announcement';
import { announcementReactionSchema } from './announcement-reaction';
import { chatSchema } from './chat';
import { conversationSchema } from './conversation';
import { markersSchema } from './marker';
import { notificationSchema } from './notification';
import { statusSchema } from './status';

const followRelationshipUpdateSchema = v.object({
  state: z.enum(['follow_pending', 'follow_accept', 'follow_reject']),
  follower: v.object({
    id: v.string(),
    follower_count: v.fallback(v.nullable(v.number()), null),
    following_count: v.fallback(v.nullable(v.number()), null),
  }),
  following: v.object({
    id: v.string(),
    follower_count: v.fallback(v.nullable(v.number()), null),
    following_count: v.fallback(v.nullable(v.number()), null),
  }),
});

type FollowRelationshipUpdate = v.InferOutput<typeof followRelationshipUpdateSchema>;

const baseStreamingEventSchema = v.object({
  stream: z.array(v.string()).catch([]),
});

const statusStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.enum(['update', 'status.update']),
  payload: z.preprocess((payload: any) => JSON.parse(payload), statusSchema),
});

const stringStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.enum(['delete', 'announcement.delete']),
  payload: v.string(),
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
  payload: z.preprocess((payload: any) => JSON.parse(payload), v.object({
    type: v.string(),
    result: z.enum(['success', 'ignored', 'error']),
  })),
});

const markerStreamingEventSchema = baseStreamingEventSchema.extend({
  event: z.literal('marker'),
  payload: z.preprocess((payload: any) => JSON.parse(payload), markersSchema),
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
  markerStreamingEventSchema,
])) as any;

type StreamingEvent = v.InferOutput<
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
| typeof markerStreamingEventSchema
>;

export {
  followRelationshipUpdateSchema,
  streamingEventSchema,
  type FollowRelationshipUpdate,
  type StreamingEvent,
};
