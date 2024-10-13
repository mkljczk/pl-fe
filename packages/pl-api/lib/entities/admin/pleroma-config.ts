import * as v from 'valibot';

const pleromaConfigSchema = v.object({
  configs: z.array(v.object({
    value: z.any(),
    group: v.string(),
    key: v.string(),
  })),
  need_reboot: v.boolean(),
});

type PleromaConfig = v.InferOutput<typeof pleromaConfigSchema>

export { pleromaConfigSchema, type PleromaConfig };
