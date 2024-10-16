import * as v from 'valibot';

import { datetimeSchema } from './utils';

import { accountSchema, statusSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/NotificationRequest} */
const notificationRequestSchema = v.object({
  id: v.string(),
  created_at: datetimeSchema,
  updated_at: datetimeSchema,
  account: accountSchema,
  notifications_count: v.pipe(v.unknown(), v.transform(String)),
  last_status: v.fallback(v.optional(statusSchema), undefined),
});

type NotificationRequest = v.InferOutput<typeof notificationRequestSchema>;

export { notificationRequestSchema, type NotificationRequest };
