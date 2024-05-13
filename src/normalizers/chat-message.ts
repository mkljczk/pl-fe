import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import { normalizeAttachment } from 'soapbox/normalizers/attachment';

import type { Attachment, Card, Emoji } from 'soapbox/types/entities';

const ChatMessageRecord = ImmutableRecord({
  account_id: '',
  media_attachments: ImmutableList<Attachment>(),
  card: null as Card | null,
  chat_id: '',
  content: '',
  created_at: '',
  emojis: ImmutableList<Emoji>(),
  expiration: null as number | null,
  id: '',
  unread: false,
  deleting: false,
  pending: false as boolean | undefined,
});

const normalizeMedia = (status: ImmutableMap<string, any>) => {
  const attachments = status.get('media_attachments');
  const attachment = status.get('attachment');

  if (attachments) {
    return status.set('media_attachments', ImmutableList(attachments.map(normalizeAttachment)));
  } else if (attachment) {
    return status.set('media_attachments', ImmutableList([normalizeAttachment(attachment)]));
  } else {
    return status.set('media_attachments', ImmutableList());
  }
};

/** Rewrite `<p></p>` to empty string. */
const fixContent = (chatMessage: ImmutableMap<string, any>) => {
  if (chatMessage.get('content') === '<p></p>') {
    return chatMessage.set('content', '');
  } else {
    return chatMessage;
  }
};

const normalizeChatMessage = (chatMessage: Record<string, any>) => ChatMessageRecord(
  ImmutableMap(fromJS(chatMessage)).withMutations(chatMessage => {
    normalizeMedia(chatMessage);
    fixContent(chatMessage);
  }),
);

export { ChatMessageRecord, normalizeChatMessage };
