import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/NotificationPolicy} */
const notificationPolicySchema = v.object({
  filter_not_following: v.boolean(),
  filter_not_followers: v.boolean(),
  filter_new_accounts: v.boolean(),
  filter_private_mentions: v.boolean(),
  summary: v.object({
    pending_requests_count: v.pipe(v.number(), v.integer()),
    pending_notifications_count: v.pipe(v.number(), v.integer()),
  }),
});

type NotificationPolicy = v.InferOutput<typeof notificationPolicySchema>;

export { notificationPolicySchema, type NotificationPolicy };
