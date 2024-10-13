import * as v from 'valibot';

const bookmarkFolderSchema = v.object({
  id: z.coerce.string(),
  name: v.fallback(v.string(), ''),
  emoji: v.fallback(v.nullable(v.string()), null),
  emoji_url: v.fallback(v.nullable(v.string()), null),
});

type BookmarkFolder = v.InferOutput<typeof bookmarkFolderSchema>;

export { bookmarkFolderSchema, type BookmarkFolder };
