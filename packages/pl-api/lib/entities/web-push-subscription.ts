import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/WebPushSubscription/} */
const webPushSubscriptionSchema = z.object({
  id: z.coerce.string(),
  endpoint: z.string(),
  alerts: z.record(z.boolean()),
  server_key: z.string(),
});

type WebPushSubscription = z.infer<typeof webPushSubscriptionSchema>;

export { webPushSubscriptionSchema, type WebPushSubscription };
