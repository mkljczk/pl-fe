import { z } from 'zod';

const hexSchema = z.string().regex(/^#[a-f0-9]{6}$/i);

const roleSchema = z.object({
  id: z.string().catch(''),
  name: z.string().catch(''),
  color: hexSchema.catch(''),
  permissions: z.string().catch(''),
  highlighted: z.boolean().catch(true),
});

type Role = z.infer<typeof roleSchema>;

export {
  roleSchema,
  type Role,
};
