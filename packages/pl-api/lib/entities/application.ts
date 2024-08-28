import { z } from 'zod';

import type { Resolve } from '../utils/types';

/** @see {@link https://docs.joinmastodon.org/entities/Application/} */
const applicationSchema = z.object({
  name: z.string().catch(''),
  website: z.string().optional().catch(undefined),
  client_id: z.string().optional().catch(undefined),
  client_secret: z.string().optional().catch(undefined),
  redirect_uri: z.string().optional().catch(undefined),

  id: z.string().optional().catch(undefined),

  /** @deprecated */
  vapid_key: z.string().optional().catch(undefined),
});

type Application = Resolve<z.infer<typeof applicationSchema>>;

export { applicationSchema, type Application };
