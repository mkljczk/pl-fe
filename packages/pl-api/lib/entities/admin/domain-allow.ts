import { z } from 'zod';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_DomainAllow/} */
const adminDomainAllowSchema = z.object({
  id: z.string(),
  domain: z.string(),
  created_at: dateSchema,
});

type AdminDomainAllow = z.infer<typeof adminDomainAllowSchema>;

export {
  adminDomainAllowSchema,
  type AdminDomainAllow,
};
