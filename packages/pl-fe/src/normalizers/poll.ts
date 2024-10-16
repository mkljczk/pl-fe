import escapeTextContentForBrowser from 'escape-html';
import DOMPurify from 'isomorphic-dompurify';

import emojify from 'pl-fe/features/emoji';
import { makeEmojiMap } from 'pl-fe/utils/normalizers';

import type { Status as BaseStatus, StatusEdit as BaseStatusEdit, CustomEmoji } from 'pl-api';

const sanitizeTitle = (text: string, emojiMap: Record<string, CustomEmoji>) => DOMPurify.sanitize(emojify(escapeTextContentForBrowser(text), emojiMap), { ALLOWED_TAGS: ['img'] });

const normalizePoll = (poll: Exclude<BaseStatus['poll'], null>) => {
  const emojiMap = makeEmojiMap(poll.emojis);
  return {
    ...poll,
    options: poll.options.map(option => ({
      ...option,
      title_emojified: sanitizeTitle(option.title, emojiMap),
      title_map_emojified: option.title_map
        ? Object.fromEntries(Object.entries(option.title_map).map(([key, title]) => [key, sanitizeTitle(title, emojiMap)]))
        : null,
    })),
  };
};

const normalizePollEdit = (poll: Exclude<BaseStatusEdit['poll'], null>, emojis: Array<CustomEmoji>) => {
  const emojiMap = makeEmojiMap(emojis);
  return {
    ...poll,
    options: poll.options.map(option => ({
      ...option,
      title_emojified: sanitizeTitle(option.title, emojiMap),
    })),
  };
};

type Poll = ReturnType<typeof normalizePoll>;
type PollEdit = ReturnType<typeof normalizePollEdit>;

export {
  normalizePoll,
  normalizePollEdit,
  type Poll,
  type PollEdit,
};
