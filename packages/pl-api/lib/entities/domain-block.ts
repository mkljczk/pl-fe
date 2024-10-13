import * as v from 'valibot';

/** @see {@link https://docs.joinmastodon.org/entities/DomainBlock} */
const domainBlockSchema = v.object({
  domain: v.string(),
  digest: v.string(),
  severity: z.enum(['silence', 'suspend']),
  comment: v.fallback(v.optional(v.string()), undefined),
});

type DomainBlock = v.InferOutput<typeof domainBlockSchema>;

export { domainBlockSchema, type DomainBlock };
