import { z } from 'zod';

import type { Resolve } from '../utils/types';

const bookmarkFolderSchema = z.object({
  id: z.coerce.string(),
  name: z.string().catch(''),
  emoji: z.string().nullable().catch(null),
  emoji_url: z.string().nullable().catch(null),
});

type BookmarkFolder = Resolve<z.infer<typeof bookmarkFolderSchema>>;

export { bookmarkFolderSchema, type BookmarkFolder };
