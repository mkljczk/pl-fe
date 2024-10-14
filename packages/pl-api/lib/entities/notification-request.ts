import * as v from 'valibot';

import { dateSchema } from './utils';

import { accountSchema, statusSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/NotificationRequest} */
const notificationRequestSchema = v.object({
  id: v.string(),
  created_at: dateSchema,
  updated_at: dateSchema,
  account: accountSchema,
  notifications_count: z.coerce.string(),
  last_status: v.fallback(v.optional(statusSchema), undefined),
});

type NotificationRequest = v.InferOutput<typeof notificationRequestSchema>;

export { notificationRequestSchema, type NotificationRequest };
