import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/WebPushSubscription/} */
const webPushSubscriptionSchema = v.object({
  id: z.coerce.string(),
  endpoint: v.string(),
  alerts: v.record(v.string(), z.boolean()),
  server_key: v.string(),
});

type WebPushSubscription = v.InferOutput<typeof webPushSubscriptionSchema>;

export { webPushSubscriptionSchema, type WebPushSubscription };
