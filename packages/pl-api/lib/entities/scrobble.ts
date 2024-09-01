import { z } from 'zod';

import { accountSchema } from './account';

const scrobbleSchema = z.preprocess((scrobble: any) => scrobble ? {
  external_link: scrobble.externalLink,
  ...scrobble,
} : null, z.object({
  id: z.coerce.string(),
  account: accountSchema,
  created_at: z.string().datetime({ offset: true }),
  title: z.string(),
  artist: z.string().catch(''),
  album: z.string().catch(''),
  external_link: z.string().nullable().catch(null),
  length: z.number().nullable().catch(null),
}));

type Scrobble = z.infer<typeof scrobbleSchema>;

export { scrobbleSchema, type Scrobble };
