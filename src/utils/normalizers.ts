import z from 'zod';

const makeEmojiMap = (emojis: any) => emojis.reduce((obj: any, emoji: any) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

/** Normalize entity ID */
const normalizeId = (id: any): string | null => z.string().nullable().catch(null).parse(id);

export {
  makeEmojiMap,
  normalizeId,
};
