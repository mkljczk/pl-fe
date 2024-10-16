import data from '@emoji-mart/data/sets/14/twitter.json';

import type { EmojiData } from './types';

const emojiData = data as EmojiData;
const { categories, emojis, aliases, sheet } = emojiData;

export {
  categories,
  emojis,
  aliases,
  sheet,
  emojiData as default,
};
