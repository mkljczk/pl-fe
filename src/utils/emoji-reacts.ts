import { List as ImmutableList } from 'immutable';

import { EmojiReaction, emojiReactionSchema } from 'soapbox/schemas';

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

const sortEmoji = (emojiReacts: ImmutableList<EmojiReaction>, allowedEmoji: ImmutableList<string>): ImmutableList<EmojiReaction> => (
  emojiReacts
    .sortBy(emojiReact =>
      -((emojiReact.count || 0) + Number(allowedEmoji.includes(emojiReact.name))))
);

const mergeEmojiFavourites = (emojiReacts: ImmutableList<EmojiReaction> | null, favouritesCount: number, favourited: boolean) => {
  if (!emojiReacts) return ImmutableList([emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: '👍' })]);
  if (!favouritesCount) return emojiReacts;
  const likeIndex = emojiReacts.findIndex(emojiReact => emojiReact.name === '👍');
  if (likeIndex > -1) {
    const likeCount = Number(emojiReacts.getIn([likeIndex, 'count']));
    favourited = favourited || Boolean(emojiReacts.getIn([likeIndex, 'me'], false));
    return emojiReacts
      .setIn([likeIndex, 'count'], likeCount + favouritesCount)
      .setIn([likeIndex, 'me'], favourited);
  } else {
    return emojiReacts.push(emojiReactionSchema.parse({ count: favouritesCount, me: favourited, name: '👍' }));
  }
};

const reduceEmoji = (emojiReacts: ImmutableList<EmojiReaction> | null, favouritesCount: number, favourited: boolean, allowedEmoji = ALLOWED_EMOJI): ImmutableList<EmojiReaction> => (
  sortEmoji(
    mergeEmojiFavourites(emojiReacts, favouritesCount, favourited),
    allowedEmoji,
  ));

const getReactForStatus = (status: any, allowedEmoji = ALLOWED_EMOJI): EmojiReaction | undefined => {
  if (!status.reactions) return;

  const result = reduceEmoji(
    status.reactions,
    status.favourites_count || 0,
    status.favourited,
    allowedEmoji,
  ).filter(e => e.me === true)
    .get(0);

  return typeof result?.name === 'string' ? result : undefined;
};

const simulateEmojiReact = (emojiReacts: ImmutableList<EmojiReaction>, emoji: string, url?: string) => {
  const idx = emojiReacts.findIndex(e => e.name === emoji);
  const emojiReact = emojiReacts.get(idx);

  if (idx > -1 && emojiReact) {
    return emojiReacts.set(idx, emojiReactionSchema.parse({
      ...emojiReact,
      count: (emojiReact.count || 0) + 1,
      me: true,
      url,
    }));
  } else {
    return emojiReacts.push(emojiReactionSchema.parse({
      count: 1,
      me: true,
      name: emoji,
      url,
    }));
  }
};

const simulateUnEmojiReact = (emojiReacts: ImmutableList<EmojiReaction>, emoji: string) => {
  const idx = emojiReacts.findIndex(e =>
    e.name === emoji && e.me === true);

  const emojiReact = emojiReacts.get(idx);

  if (emojiReact) {
    const newCount = (emojiReact.count || 1) - 1;
    if (newCount < 1) return emojiReacts.delete(idx);
    return emojiReacts.set(idx, emojiReactionSchema.parse({
      ...emojiReact,
      count: (emojiReact.count || 1) - 1,
      me: false,
    }));
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
