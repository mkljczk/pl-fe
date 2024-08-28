import z from 'zod';

const adminDomainSchema = z.object({
  domain: z.string().catch(''),
  id: z.coerce.string(),
  public: z.boolean().catch(false),
  resolves: z.boolean().catch(false),
  last_checked_at: z.string().datetime().catch(''),
});

type AdminDomain = z.infer<typeof adminDomainSchema>

export { adminDomainSchema, type AdminDomain };
