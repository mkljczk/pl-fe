import z from 'zod';

/** Use new value only if old value is undefined */
const mergeDefined = (oldVal: any, newVal: any) => oldVal === undefined ? newVal : oldVal;

const makeEmojiMap = (emojis: any) => emojis.reduce((obj: any, emoji: any) => {
  obj[`:${emoji.shortcode}:`] = emoji;
  return obj;
}, {});

/** Normalize entity ID */
const normalizeId = (id: any): string | null => z.string().nullable().catch(null).parse(id);

type Normalizer<V, R> = (value: V) => R;

/**
 * Allows using any legacy normalizer function as a zod schema.
 *
 * @example
 * ```ts
 * const statusSchema = toSchema(normalizeStatus);
 * statusSchema.parse(status);
 * ```
 */
const toSchema = <V, R>(normalizer: Normalizer<V, R>) => z.custom<V>().transform<R>(normalizer);

/** Legacy normalizer transition helper function. */
const maybeFromJS = (value: any): unknown => {
  if ('toJS' in value) {
    return value.toJS();
  } else {
    return value;
  }
};

export {
  type Normalizer,
  mergeDefined,
  makeEmojiMap,
  normalizeId,
  toSchema,
  maybeFromJS,
};
