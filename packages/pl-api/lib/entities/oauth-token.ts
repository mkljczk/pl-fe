import { z } from 'zod';

/** @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#get-apioauth_tokens} */
const oauthTokenSchema = z.preprocess((token: any) => ({
  ...token,
  valid_until: token?.valid_until?.padEnd(27, 'Z'),
}), z.object({
  app_name: z.string(),
  id: z.number(),
  valid_until: z.string().datetime({ offset: true }),
}));

type OauthToken = z.infer<typeof oauthTokenSchema>;

export { oauthTokenSchema, type OauthToken };
