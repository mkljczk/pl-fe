import { z } from 'zod';

import { Resolve } from '../utils/types';

import { accountSchema } from './account';
import { customEmojiSchema } from './custom-emoji';
import { mediaAttachmentSchema } from './media-attachment';
import { dateSchema, filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/StatusEdit/} */
const statusEditSchema = z.object({
  content: z.string().catch(''),
  spoiler_text: z.string().catch(''),
  sensitive: z.coerce.boolean(),
  created_at: dateSchema,
  account: accountSchema,
  poll: z.object({
    options: z.array(z.object({
      title: z.string(),
    })),
  }).nullable().catch(null),
  media_attachments: filteredArray(mediaAttachmentSchema),
  emojis: filteredArray(customEmojiSchema),
});

type StatusEdit = Resolve<z.infer<typeof statusEditSchema>>;

export { statusEditSchema, type StatusEdit };
