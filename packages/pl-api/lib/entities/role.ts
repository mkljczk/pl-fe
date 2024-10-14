import * as v from 'valibot';

const hexSchema = v.pipe(v.string(), v.regex(/^#[a-f0-9]{6}$/i));

const roleSchema = v.object({
  id: v.fallback(v.string(), ''),
  name: v.fallback(v.string(), ''),
  color: v.fallback(hexSchema, ''),
  permissions: v.fallback(v.string(), ''),
  highlighted: v.fallback(v.boolean(), true),
});

type Role = v.InferOutput<typeof roleSchema>;

export {
  roleSchema,
  type Role,
};
