import * as v from 'valibot';

import { mediaAttachmentSchema } from './media-attachment';
import { filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/ScheduledStatus/} */
const scheduledStatusSchema = v.object({
  id: v.string(),
  scheduled_at: z.string().datetime({ offset: true }),
  params: v.object({
    text: v.fallback(v.nullable(v.string()), null),
    poll: v.object({
      options: z.array(v.string()),
      expires_in: z.coerce.string(),
      multiple: v.fallback(v.optional(v.boolean()), undefined),
      hide_totals: v.fallback(v.optional(v.boolean()), undefined),
    }).nullable().catch(null),
    media_ids: v.fallback(v.nullable(v.string()), null),
    sensitive: v.fallback(v.nullable(z.coerce.boolean()), null),
    spoiler_text: v.fallback(v.nullable(v.string()), null),
    visibility: z.string().catch('public'),
    in_reply_to_id: v.fallback(v.nullable(v.string()), null),
    language: v.fallback(v.nullable(v.string()), null),
    application_id: v.fallback(v.nullable(z.number().int()), null),
    scheduled_at: v.fallback(v.nullable(z.string().datetime({ offset: true })), null),
    idempotency: v.fallback(v.nullable(v.string()), null),
    with_rate_limit: v.fallback(v.boolean(), false),

    expires_in: v.fallback(v.nullable(v.number()), null),
  }),
  media_attachments: filteredArray(mediaAttachmentSchema),
});

type ScheduledStatus = v.InferOutput<typeof scheduledStatusSchema>;

export { scheduledStatusSchema, type ScheduledStatus };
