import * as v from 'valibot';

const directoryServerSchema = v.object({
  domain: v.string(),
  version: v.string(),
  description: v.string(),
  languages: z.array(v.string()),
  region: v.string(),
  categories: z.array(v.string()),
  proxied_thumbnail: z.string().url().nullable().catch(null),
  blurhash: v.fallback(v.nullable(v.string()), null),
  total_users: z.coerce.number(),
  last_week_users: z.coerce.number(),
  approval_required: v.boolean(),
  language: v.string(),
  category: v.string(),
});

type DirectoryServer = v.InferOutput<typeof directoryServerSchema>;

export { directoryServerSchema, type DirectoryServer };
