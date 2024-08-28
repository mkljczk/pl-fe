import { z } from 'zod';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_IpBlock/} */
const adminIpBlockSchema = z.object({
  id: z.string(),
  ip: z.string().ip(),
  severity: z.enum(['sign_up_requires_approval', 'sign_up_block', 'no_access']),
  comment: z.string().catch(''),
  created_at: dateSchema,
  expires_at: z.string().datetime({ offset: true }),
});

type AdminIpBlock = z.infer<typeof adminIpBlockSchema>;

export {
  adminIpBlockSchema,
  type AdminIpBlock,
};
