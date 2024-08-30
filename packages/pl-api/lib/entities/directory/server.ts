import { z } from 'zod';

const directoryServerSchema = z.object({
  domain: z.string(),
  version: z.string(),
  description: z.string(),
  languages: z.array(z.string()),
  region: z.string(),
  categories: z.array(z.string()),
  proxied_thumbnail: z.string().url().nullable().catch(null),
  blurhash: z.string().nullable().catch(null),
  total_users: z.coerce.number(),
  last_week_users: z.coerce.number(),
  approval_required: z.boolean(),
  language: z.string(),
  category: z.string(),
});

type DirectoryServer = z.infer<typeof directoryServerSchema>;

export { directoryServerSchema, type DirectoryServer };
