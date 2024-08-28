/**
 * Status edit normalizer
 */
import escapeTextContentForBrowser from 'escape-html';
import DOMPurify from 'isomorphic-dompurify';

import emojify from 'pl-fe/features/emoji';
import { stripCompatibilityFeatures } from 'pl-fe/utils/html';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import { normalizePollEdit } from './poll';

import type { StatusEdit as BaseStatusEdit } from 'pl-api';

const normalizeStatusEdit = (statusEdit: BaseStatusEdit) => {
  const emojiMap = makeEmojiMap(statusEdit.emojis);

  const poll = statusEdit.poll ? normalizePollEdit(statusEdit.poll) : null;

  return {
    ...statusEdit,
    poll,
    contentHtml: DOMPurify.sanitize(stripCompatibilityFeatures(emojify(statusEdit.content, emojiMap)), { ADD_ATTR: ['target'] }),
    spoilerHtml: DOMPurify.sanitize(emojify(escapeTextContentForBrowser(statusEdit.spoiler_text), emojiMap), { ADD_ATTR: ['target'] }),
  };
};

type StatusEdit = ReturnType<typeof normalizeStatusEdit>

export { type StatusEdit, normalizeStatusEdit };
