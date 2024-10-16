import * as v from 'valibot';

import type { CustomEmoji } from 'pl-api';

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T>(schema: v.BaseSchema<any, T, v.BaseIssue<unknown>>) =>
  v.pipe(
    v.fallback(v.array(v.any()), []),
    v.transform((arr) => (
      arr.map((item) => {
        const parsed = v.safeParse(schema, item);
        return parsed.success ? parsed.output : undefined;
      }).filter((item): item is T => Boolean(item))
    )),
  );

/** Map a list of CustomEmoji to their shortcodes. */
const makeCustomEmojiMap = (customEmojis: CustomEmoji[]) =>
  customEmojis.reduce<Record<string, CustomEmoji>>((result, emoji) => {
    result[`:${emoji.shortcode}:`] = emoji;
    return result;
  }, {});

/** valibot schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends v.ObjectEntries>(shape: T) =>
  v.pipe(
    v.any(),
    v.transform((input) => typeof input === 'object' ? input : {}),
    v.object(shape),
  );

export { filteredArray, makeCustomEmojiMap, coerceObject };
