import * as v from 'valibot';

const directoryCategorySchema = v.object({
  category: v.string(),
  servers_count: z.coerce.number().nullable().catch(null),
});

type DirectoryCategory = v.InferOutput<typeof directoryCategorySchema>;

export { directoryCategorySchema, type DirectoryCategory };
