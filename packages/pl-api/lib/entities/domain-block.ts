import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/DomainBlock} */
const domainBlockSchema = z.object({
  domain: z.string(),
  digest: z.string(),
  severity: z.enum(['silence', 'suspend']),
  comment: z.string().optional().catch(undefined),
});

type DomainBlock = z.infer<typeof domainBlockSchema>;

export { domainBlockSchema, type DomainBlock };
