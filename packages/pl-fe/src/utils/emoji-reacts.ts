import { List as ImmutableList } from 'immutable';
import { emojiReactionSchema, type EmojiReaction } from 'pl-api';

import type { Status } from 'pl-fe/normalizers';

// https://emojipedia.org/facebook
// I've customized them.
const ALLOWED_EMOJI = ImmutableList([
  '👍',
  '❤️',
  '😆',
  '😮',
  '😢',
  '😩',
]);

const sortEmoji = (emojiReacts: Array<EmojiReaction>, allowedEmoji: ImmutableList<string>): Array<EmojiReaction> => (
  emojiReacts
    .toSorted(emojiReact =>
      -((emojiReact.count || 0) + Number(allowedEmoji.includes(emojiReact.name))))
);

const mergeEmojiFavourites = (emojiReacts: Array<EmojiReaction> | null, favouritesCount: number, favourited: boolean) => {
  if (!emojiReacts) return [emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: '👍' })];
  if (!favouritesCount) return emojiReacts;
  const likeIndex = emojiReacts.findIndex(emojiReact => emojiReact.name === '👍');
  if (likeIndex > -1) {
    const likeCount = Number(emojiReacts[likeIndex].count);
    favourited = favourited || Boolean(emojiReacts[likeIndex].me || false);
    return emojiReacts.map((reaction, index) => index === likeIndex ? {
      ...reaction,
      count: likeCount + favouritesCount,
      me: favourited,
    } : reaction);
  } else {
    return [...emojiReacts, emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: '👍' })];
  }
};

const reduceEmoji = (emojiReacts: Array<EmojiReaction> | null, favouritesCount: number, favourited: boolean, allowedEmoji = ALLOWED_EMOJI): Array<EmojiReaction> => (
  sortEmoji(
    mergeEmojiFavourites(emojiReacts, favouritesCount, favourited),
    allowedEmoji,
  )
);

const getReactForStatus = (
  status: Pick<Status, 'emoji_reactions' | 'favourited' | 'favourites_count'>,
  allowedEmoji = ALLOWED_EMOJI,
): EmojiReaction | undefined => {
  if (!status.emoji_reactions) return;

  const result = reduceEmoji(
    status.emoji_reactions,
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).filter(e => e.me === true)[0];

  return typeof result?.name === 'string' ? result : undefined;
};

const simulateEmojiReact = (emojiReacts: Array<EmojiReaction>, emoji: string, url?: string) => {
  const idx = emojiReacts.findIndex(e => e.name === emoji);
  const emojiReact = emojiReacts[idx];

  if (idx > -1 && emojiReact) {
    return emojiReacts.map((reaction, id) => id === idx ? emojiReactionSchema.parse({
      ...emojiReact,
      count: (emojiReact.count || 0) + 1,
      me: true,
      url,
    }) : reaction);
  } else {
    return [...emojiReacts, emojiReactionSchema.parse({
      count: 1,
      me: true,
      name: emoji,
      url,
    })];
  }
};

const simulateUnEmojiReact = (emojiReacts: Array<EmojiReaction>, emoji: string) => {
  const idx = emojiReacts.findIndex(e =>
    e.name === emoji && e.me === true);

  const emojiReact = emojiReacts[idx];

  if (emojiReact) {
    const newCount = (emojiReact.count || 1) - 1;
    if (newCount < 1) return emojiReacts.filter((_, id) => id !== idx);
    return emojiReacts.map((reaction, id) => id === idx ? emojiReactionSchema.parse({
      ...emojiReact,
      count: (emojiReact.count || 1) - 1,
      me: false,
    }) : reaction);
  } else {
    return emojiReacts;
  }
};

export {
  ALLOWED_EMOJI,
  sortEmoji,
  mergeEmojiFavourites,
  reduceEmoji,
  getReactForStatus,
  simulateEmojiReact,
  simulateUnEmojiReact,
};
