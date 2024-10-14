import * as v from 'valibot';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_EmailDomainBlock/} */
const adminEmailDomainBlockSchema = v.object({
  id: v.string(),
  domain: v.string(),
  created_at: dateSchema,
  history: v.array(v.object({
    day: v.pipe(v.unknown(), v.transform(String)),
    accounts: v.pipe(v.unknown(), v.transform(String)),
    uses: v.pipe(v.unknown(), v.transform(String)),
  })),
});

type AdminEmailDomainBlock = v.InferOutput<typeof adminEmailDomainBlockSchema>;

export {
  adminEmailDomainBlockSchema,
  type AdminEmailDomainBlock,
};
