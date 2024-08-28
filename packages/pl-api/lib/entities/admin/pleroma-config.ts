import { z } from 'zod';

const pleromaConfigSchema = z.object({
  configs: z.array(z.object({
    value: z.any(),
    group: z.string(),
    key: z.string(),
  })),
  need_reboot: z.boolean(),
});

type PleromaConfig = z.infer<typeof pleromaConfigSchema>

export { pleromaConfigSchema, type PleromaConfig };
