import { z } from 'zod';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Ip/} */
const adminIpSchema = z.object({
  ip: z.string().ip(),
  used_at: dateSchema,
});

type AdminIp = z.infer<typeof adminIpSchema>;

export {
  adminIpSchema,
  type AdminIp,
};
