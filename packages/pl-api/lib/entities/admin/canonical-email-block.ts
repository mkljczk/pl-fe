import { z } from 'zod';

/** @see {@link https://docs.joinmastodon.org/entities/Admin_CanonicalEmailBlock/} */
const adminCanonicalEmailBlockSchema = z.object({
  id: z.string(),
  canonical_email_hash: z.string(),
});

type AdminCanonicalEmailBlock = z.infer<typeof adminCanonicalEmailBlockSchema>;

export {
  adminCanonicalEmailBlockSchema,
  type AdminCanonicalEmailBlock,
};
