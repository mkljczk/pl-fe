import { z } from 'zod';

import { accountSchema } from './account';
import { chatMessageSchema } from './chat-message';
import { dateSchema } from './utils';

/** @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-a-list-of-chats} */
const chatSchema = z.object({
  id: z.string(),
  account: accountSchema,
  unread: z.number().int(),
  last_message: chatMessageSchema.nullable().catch(null),
  created_at: dateSchema,
});

type Chat = z.infer<typeof chatSchema>;

export { chatSchema, type Chat };
