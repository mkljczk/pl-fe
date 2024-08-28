import { z } from 'zod';

import { dateSchema } from '../utils';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_DomainBlock/} */
const adminDomainBlockSchema = z.object({
  id: z.string(),
  domain: z.string(),
  digest: z.string(),
  created_at: dateSchema,
  severity: z.enum(['silence', 'suspend', 'noop']),
  reject_media: z.boolean(),
  reject_reports: z.boolean(),
  private_comment: z.string().nullable().catch(null),
  public_comment: z.string().nullable().catch(null),
  obfuscate: z.boolean(),
});

type AdminDomainBlock = z.infer<typeof adminDomainBlockSchema>;

export {
  adminDomainBlockSchema,
  type AdminDomainBlock,
};
