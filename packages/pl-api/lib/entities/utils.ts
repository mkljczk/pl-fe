import * as v from 'valibot';

/** Validate to Mastodon's date format, or use the current date. */
const dateSchema = z.string().datetime({ offset: true }).catch(new Date().toUTCString());

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

/** Validates the string as an emoji. */
const emojiSchema = v.pipe(v.string(), v.emoji());

/** MIME schema, eg `image/png`. */
const mimeSchema = v.pipe(v.string(), v.regex(/^\w+\/[-+.\w]+$/));

/** valibot schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends v.ObjectEntries>(shape: T) =>
  v.pipe(
    v.any(),
    v.transform((input) => typeof input === 'object' ? input : {}),
    v.object(shape),
  );

export { filteredArray, emojiSchema, dateSchema, mimeSchema, coerceObject };
