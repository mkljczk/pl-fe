import { z } from 'zod';

/** @see {@link https://docs.pleroma.social/backend/development/API/admin_api/#get-apiv1pleromaadminrules} */
const adminRuleSchema = z.object({
  id: z.string(),
  text: z.string().catch(''),
  hint: z.string().catch(''),
  priority: z.number().nullable().catch(null),
});

type AdminRule = z.infer<typeof adminRuleSchema>;

export { adminRuleSchema, type AdminRule };
