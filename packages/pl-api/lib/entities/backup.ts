import { z } from 'zod';

import { dateSchema, mimeSchema } from './utils';

/** @see {@link https://docs.pleroma.social/backend/development/API/pleroma_api/#post-apiv1pleromabackups} */
const backupSchema = z.object({
  id: z.coerce.string(),
  contentType: mimeSchema,
  file_size: z.number().catch(0),
  inserted_at: dateSchema,
  processed: z.boolean().catch(false),
  url: z.string().catch(''),
});

type Backup = z.infer<typeof backupSchema>;

export { backupSchema, type Backup };
