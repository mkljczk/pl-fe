import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/NotificationPolicy} */
const notificationPolicySchema = z.object({
  filter_not_following: z.boolean(),
  filter_not_followers: z.boolean(),
  filter_new_accounts: z.boolean(),
  filter_private_mentions: z.boolean(),
  summary: z.object({
    pending_requests_count: z.number().int(),
    pending_notifications_count: z.number().int(),
  }),
});

type NotificationPolicy = z.infer<typeof notificationPolicySchema>;

export { notificationPolicySchema, type NotificationPolicy };
