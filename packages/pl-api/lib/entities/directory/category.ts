import { z } from 'zod';

const directoryCategorySchema = z.object({
  category: z.string(),
  servers_count: z.coerce.number().nullable().catch(null),
});

type DirectoryCategory = z.infer<typeof directoryCategorySchema>;

export { directoryCategorySchema, type DirectoryCategory };
