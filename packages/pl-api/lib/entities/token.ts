import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/Token/} */
const tokenSchema = v.object({
  access_token: v.string(),
  token_type: v.string(),
  scope: v.string(),
  created_at: z.number().optional().catch(undefined),

  id: z.number().optional().catch(undefined),
  refresh_token: v.fallback(v.optional(v.string()), undefined),
  expires_in: z.number().optional().catch(undefined),
  me: v.fallback(v.optional(v.string()), undefined),
});

type Token = v.InferOutput<typeof tokenSchema>;

export { tokenSchema, type Token };
