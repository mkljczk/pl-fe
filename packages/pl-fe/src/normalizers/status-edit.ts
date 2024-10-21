/**
 * Status edit normalizer
 */
import escapeTextContentForBrowser from 'escape-html';

import emojify from 'pl-fe/features/emoji';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import type { StatusEdit as BaseStatusEdit } from 'pl-api';

const normalizeStatusEdit = (statusEdit: BaseStatusEdit) => {
  const emojiMap = makeEmojiMap(statusEdit.emojis);

  return {
    ...statusEdit,
    contentHtml: emojify(statusEdit.content, emojiMap),
    spoilerHtml: emojify(escapeTextContentForBrowser(statusEdit.spoiler_text), emojiMap),
  };
};

type StatusEdit = ReturnType<typeof normalizeStatusEdit>

export { type StatusEdit, normalizeStatusEdit };
