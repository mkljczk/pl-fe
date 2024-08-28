import { z } from 'zod';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_EmailDomainBlock/} */
const adminEmailDomainBlockSchema = z.object({
  id: z.string(),
  domain: z.string(),
  created_at: dateSchema,
  history: z.array(z.object({
    day: z.coerce.string(),
    accounts: z.coerce.string(),
    uses: z.coerce.string(),
  })),
});

type AdminEmailDomainBlock = z.infer<typeof adminEmailDomainBlockSchema>;

export {
  adminEmailDomainBlockSchema,
  type AdminEmailDomainBlock,
};
