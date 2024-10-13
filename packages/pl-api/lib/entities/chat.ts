import * as v from 'valibot';

import { accountSchema } from './account';
import { chatMessageSchema } from './chat-message';
import { dateSchema } from './utils';

/** @see {@link https://docs.pleroma.social/backend/development/API/chats/#getting-a-list-of-chats} */
const chatSchema = v.object({
  id: v.string(),
  account: accountSchema,
  unread: z.number().int(),
  last_message: v.fallback(v.nullable(chatMessageSchema), null),
  created_at: dateSchema,
});

type Chat = v.InferOutput<typeof chatSchema>;

export { chatSchema, type Chat };
