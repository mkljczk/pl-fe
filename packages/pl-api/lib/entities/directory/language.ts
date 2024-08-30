import { z } from 'zod';

const directoryLanguageSchema = z.object({
  locale: z.string(),
  language: z.string(),
  servers_count: z.coerce.number().nullable().catch(null),
});

type DirectoryLanguage = z.infer<typeof directoryLanguageSchema>;

export { directoryLanguageSchema, type DirectoryLanguage };
