import { z } from 'zod';

const baseRuleSchema = z.object({
  id: z.string(),
  text: z.string().catch(''),
  hint: z.string().catch(''),
});

/** @see {@link https://docs.joinmastodon.org/entities/Rule/} */
const ruleSchema = z.preprocess((data: any) => ({
  ...data,
  hint: data.hint || data.subtext,
}), baseRuleSchema);

type Rule = z.infer<typeof ruleSchema>;

export { ruleSchema, type Rule };
