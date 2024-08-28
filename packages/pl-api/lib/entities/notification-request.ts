import { z } from 'zod';

import { dateSchema } from './utils';

import { accountSchema, statusSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/NotificationRequest} */
const notificationRequestSchema = z.object({
  id: z.string(),
  created_at: dateSchema,
  updated_at: dateSchema,
  account: accountSchema,
  notifications_count: z.coerce.string(),
  last_status: statusSchema.optional().catch(undefined),
});

type NotificationRequest = z.infer<typeof notificationRequestSchema>;

export { notificationRequestSchema, type NotificationRequest };
