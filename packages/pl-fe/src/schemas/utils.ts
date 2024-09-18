import z from 'zod';

import type { CustomEmoji } from 'pl-api';

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .any()
    .array()
    .catch([])
    .transform((arr) =>
      arr
        .map((item) => {
          const parsed = schema.safeParse(item);
          return parsed.success ? parsed.data : undefined;
        })
        .filter((item): item is z.infer<T> => Boolean(item)),
    );

/** Map a list of CustomEmoji to their shortcodes. */
const makeCustomEmojiMap = (customEmojis: CustomEmoji[]) =>
  customEmojis.reduce<Record<string, CustomEmoji>>((result, emoji) => {
    result[`:${emoji.shortcode}:`] = emoji;
    return result;
  }, {});
/** zod schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends z.ZodRawShape>(shape: T) =>
  z.object({}).passthrough().catch({}).pipe(z.object(shape));

export { filteredArray, makeCustomEmojiMap, coerceObject };
