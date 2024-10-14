import * as v from 'valibot';

const directoryCategorySchema = v.object({
  category: v.string(),
  servers_count: v.fallback(v.nullable(z.coerce.number()), null),
});

type DirectoryCategory = v.InferOutput<typeof directoryCategorySchema>;

export { directoryCategorySchema, type DirectoryCategory };
