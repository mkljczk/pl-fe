import * as v from 'valibot';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_EmailDomainBlock/} */
const adminEmailDomainBlockSchema = v.object({
  id: v.string(),
  domain: v.string(),
  created_at: dateSchema,
  history: v.array(v.object({
    day: z.coerce.string(),
    accounts: z.coerce.string(),
    uses: z.coerce.string(),
  })),
});

type AdminEmailDomainBlock = v.InferOutput<typeof adminEmailDomainBlockSchema>;

export {
  adminEmailDomainBlockSchema,
  type AdminEmailDomainBlock,
};
