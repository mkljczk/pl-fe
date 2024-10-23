import data from '@emoji-mart/data/sets/15/twitter.json';

interface NativeEmoji {
  unified: string;
  native: string;
  x: number;
  y: number;
}

interface CustomEmoji {
  src: string;
}

interface Emoji<T> {
  id: string;
  name: string;
  keywords: string[];
  skins: T[];
  version?: number;
}

interface EmojiCategory {
  id: string;
  emojis: string[];
}

interface EmojiMap {
  [s: string]: Emoji<NativeEmoji>;
}

interface EmojiAlias {
  [s: string]: string;
}

interface EmojiSheet {
  cols: number;
  rows: number;
}

interface EmojiData {
  categories: EmojiCategory[];
  emojis: EmojiMap;
  aliases: EmojiAlias;
  sheet: EmojiSheet;
}

const emojiData = data as EmojiData;
const { categories, emojis, aliases, sheet } = emojiData;

export {
  type CustomEmoji,
  type Emoji,
  type EmojiData,
  categories,
  emojis,
  aliases,
  sheet,
  emojiData as default,
};
