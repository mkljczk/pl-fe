import { z } from 'zod';

import { customEmojiSchema } from './custom-emoji';
import { mediaAttachmentSchema } from './media-attachment';
import { previewCardSchema } from './preview-card';
import { dateSchema, filteredArray } from './utils';

/** @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-the-messages-for-a-chat} */
const chatMessageSchema = z.object({
  id: z.string(),
  content: z.string().catch(''),
  chat_id: z.string(),
  account_id: z.string(),
  created_at: dateSchema,
  emojis: filteredArray(customEmojiSchema),
  attachment: mediaAttachmentSchema.nullable().catch(null),
  unread: z.boolean(),
  card: previewCardSchema.nullable().catch(null),
});

type ChatMessage = z.infer<typeof chatMessageSchema>;

export { chatMessageSchema, type ChatMessage };
