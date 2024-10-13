import * as v from 'valibot';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_Ip/} */
const adminIpSchema = v.object({
  ip: z.string().ip(),
  used_at: dateSchema,
});

type AdminIp = v.InferOutput<typeof adminIpSchema>;

export {
  adminIpSchema,
  type AdminIp,
};
