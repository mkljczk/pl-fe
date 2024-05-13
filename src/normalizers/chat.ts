import { Map as ImmutableMap, Record as ImmutableRecord, fromJS } from 'immutable';

import type { Account, EmbeddedEntity } from 'soapbox/types/entities';

const ChatRecord = ImmutableRecord({
  account: null as EmbeddedEntity<Account>,
  id: '',
  unread: 0,
  last_message: '' as string || null,
  updated_at: '',
});

const normalizeChat = (chat: Record<string, any>) => ChatRecord(
  ImmutableMap(fromJS(chat)),
);

export { ChatRecord, normalizeChat };
