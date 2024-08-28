const makeEmojiMap = (emojis: any) => emojis.reduce((obj: any, emoji: any) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

export {
  makeEmojiMap,
};
