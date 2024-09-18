import { type EmojiReaction, emojiReactionSchema } from 'pl-api';

const simulateEmojiReact = (
  emojiReacts: Array<EmojiReaction>,
  emoji: string,
  url?: string,
) => {
  const idx = emojiReacts.findIndex((e) => e.name === emoji);
  const emojiReact = emojiReacts[idx];

  if (idx > -1 && emojiReact) {
    return emojiReacts.map((reaction, id) =>
      id === idx
        ? emojiReactionSchema.parse({
            ...emojiReact,
            count: (emojiReact.count || 0) + 1,
            me: true,
            url,
          })
        : reaction,
    );
  } else {
    return [
      ...emojiReacts,
      emojiReactionSchema.parse({
        count: 1,
        me: true,
        name: emoji,
        url,
      }),
    ];
  }
};

const simulateUnEmojiReact = (
  emojiReacts: Array<EmojiReaction>,
  emoji: string,
) => {
  const idx = emojiReacts.findIndex((e) => e.name === emoji && e.me === true);

  const emojiReact = emojiReacts[idx];

  if (emojiReact) {
    const newCount = (emojiReact.count || 1) - 1;
    if (newCount < 1) return emojiReacts.filter((_, id) => id !== idx);
    return emojiReacts.map((reaction, id) =>
      id === idx
        ? emojiReactionSchema.parse({
            ...emojiReact,
            count: (emojiReact.count || 1) - 1,
            me: false,
          })
        : reaction,
    );
  } else {
    return emojiReacts;
  }
};

export { simulateEmojiReact, simulateUnEmojiReact };
