import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/NotificationPolicy} */
const notificationPolicySchema = v.object({
  filter_not_following: v.boolean(),
  filter_not_followers: v.boolean(),
  filter_new_accounts: v.boolean(),
  filter_private_mentions: v.boolean(),
  summary: v.object({
    pending_requests_count: z.number().int(),
    pending_notifications_count: z.number().int(),
  }),
});

type NotificationPolicy = v.InferOutput<typeof notificationPolicySchema>;

export { notificationPolicySchema, type NotificationPolicy };
