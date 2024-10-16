import * as v from 'valibot';

import { filteredArray } from './utils';

import { accountSchema, statusSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/Conversation} */
const conversationSchema = v.object({
  id: v.string(),
  unread: v.fallback(v.boolean(), false),
  accounts: filteredArray(accountSchema),
  last_status: v.fallback(v.nullable(statusSchema), null),
});

type Conversation = v.InferOutput<typeof conversationSchema>;

export { conversationSchema, type Conversation };
