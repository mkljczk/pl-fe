import z from 'zod';

/** Validate to Mastodon's date format, or use the current date. */
const dateSchema = z.string().datetime({ offset: true }).catch(new Date().toUTCString());

/** Validates individual items in an array, dropping any that aren't valid. */
const filteredArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.any().array().catch([])
    .transform((arr) => (
      arr.map((item) => {
        const parsed = schema.safeParse(item);
        return parsed.success ? parsed.data : undefined;
      }).filter((item): item is z.infer<T> => Boolean(item))
    ));

/** Validates the string as an emoji. */
const emojiSchema = z.string().refine((v) => /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]{2}/u.test(v));

/** MIME schema, eg `image/png`. */
const mimeSchema = z.string().regex(/^\w+\/[-+.\w]+$/);

/** zod schema to force the value into an object, if it isn't already. */
const coerceObject = <T extends z.ZodRawShape>(shape: T) =>
  z.object({}).passthrough().catch({}).pipe(z.object(shape));

export { filteredArray, emojiSchema, dateSchema, mimeSchema, coerceObject };
