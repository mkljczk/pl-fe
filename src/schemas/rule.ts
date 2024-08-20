import { z } from 'zod';

const adminRuleSchema = z.object({
  id: z.string(),
  text: z.string().catch(''),
  hint: z.string().catch(''),
  priority: z.number().nullable().catch(null),
});

type AdminRule = z.infer<typeof adminRuleSchema>;

export { adminRuleSchema, type AdminRule };
