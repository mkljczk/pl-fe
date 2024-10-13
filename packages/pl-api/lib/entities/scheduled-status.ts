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
    media_ids: z.array(v.string()).nullable().catch(null),
    sensitive: z.coerce.boolean().nullable().catch(null),
    spoiler_text: v.fallback(v.nullable(v.string()), null),
    visibility: z.string().catch('public'),
    in_reply_to_id: v.fallback(v.nullable(v.string()), null),
    language: v.fallback(v.nullable(v.string()), null),
    application_id: z.number().int().nullable().catch(null),
    scheduled_at: z.string().datetime({ offset: true }).nullable().catch(null),
    idempotency: v.fallback(v.nullable(v.string()), null),
    with_rate_limit: v.fallback(v.boolean(), false),

    expires_in: v.fallback(v.nullable(v.number()), null),
  }),
  media_attachments: filteredArray(mediaAttachmentSchema),
});

type ScheduledStatus = v.InferOutput<typeof scheduledStatusSchema>;

export { scheduledStatusSchema, type ScheduledStatus };
