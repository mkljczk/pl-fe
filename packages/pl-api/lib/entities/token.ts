import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/Token/} */
const tokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  created_at: z.number().optional().catch(undefined),

  id: z.number().optional().catch(undefined),
  refresh_token: z.string().optional().catch(undefined),
  expires_in: z.number().optional().catch(undefined),
  me: z.string().optional().catch(undefined),
});

type Token = z.infer<typeof tokenSchema>;

export { tokenSchema, type Token };
