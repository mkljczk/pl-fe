interface UnicodeMap {
  [s: string]: {
    unified: string;
    shortcode: string;
  };
}

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

export type {
  UnicodeMap,
  NativeEmoji,
  CustomEmoji,
  Emoji,
  EmojiCategory,
  EmojiMap,
  EmojiAlias,
  EmojiSheet,
  EmojiData,
};
