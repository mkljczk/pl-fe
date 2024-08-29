import { z } from 'zod';

import { mediaAttachmentSchema } from './media-attachment';
import { filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/ScheduledStatus/} */
const scheduledStatusSchema = z.object({
  id: z.string(),
  scheduled_at: z.string().datetime({ offset: true }),
  params: z.object({
    text: z.string().nullable().catch(null),
    poll: z.object({
      options: z.array(z.string()),
      expires_in: z.coerce.string(),
      multiple: z.boolean().optional().catch(undefined),
      hide_totals: z.boolean().optional().catch(undefined),
    }).nullable().catch(null),
    media_ids: z.array(z.string()).nullable().catch(null),
    sensitive: z.coerce.boolean().nullable().catch(null),
    spoiler_text: z.string().nullable().catch(null),
    visibility: z.string().catch('public'),
    in_reply_to_id: z.string().nullable().catch(null),
    language: z.string().nullable().catch(null),
    application_id: z.number().int().nullable().catch(null),
    scheduled_at: z.string().datetime({ offset: true }).nullable().catch(null),
    idempotency: z.string().nullable().catch(null),
    with_rate_limit: z.boolean().catch(false),

    expires_in: z.number().nullable().catch(null),
  }),
  media_attachments: filteredArray(mediaAttachmentSchema),
});

type ScheduledStatus = z.infer<typeof scheduledStatusSchema>;

export { scheduledStatusSchema, type ScheduledStatus };
