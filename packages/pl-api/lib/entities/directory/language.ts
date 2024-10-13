import * as v from 'valibot';

const directoryLanguageSchema = v.object({
  locale: v.string(),
  language: v.string(),
  servers_count: z.coerce.number().nullable().catch(null),
});

type DirectoryLanguage = v.InferOutput<typeof directoryLanguageSchema>;

export { directoryLanguageSchema, type DirectoryLanguage };
