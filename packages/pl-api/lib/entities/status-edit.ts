import * as v from 'valibot';

import { accountSchema } from './account';
import { customEmojiSchema } from './custom-emoji';
import { mediaAttachmentSchema } from './media-attachment';
import { dateSchema, filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/StatusEdit/} */
const statusEditSchema = v.object({
  content: v.fallback(v.string(), ''),
  spoiler_text: v.fallback(v.string(), ''),
  sensitive: z.coerce.boolean(),
  created_at: dateSchema,
  account: accountSchema,
  poll: v.object({
    options: z.array(v.object({
      title: v.string(),
    })),
  }).nullable().catch(null),
  media_attachments: filteredArray(mediaAttachmentSchema),
  emojis: filteredArray(customEmojiSchema),
});

type StatusEdit = v.InferOutput<typeof statusEditSchema>;

export { statusEditSchema, type StatusEdit };
