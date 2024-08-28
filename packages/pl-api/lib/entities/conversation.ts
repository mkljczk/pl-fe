import { z } from 'zod';

import { filteredArray } from './utils';

import { accountSchema, statusSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/Conversation} */
const conversationSchema = z.object({
  id: z.string(),
  unread: z.boolean().catch(false),
  accounts: filteredArray(accountSchema),
  last_status: statusSchema.nullable().catch(null),
});

type Conversation = z.infer<typeof conversationSchema>;

export { conversationSchema, type Conversation };
