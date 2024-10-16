import * as v from 'valibot';

import { datetimeSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/ExtendedDescription} */
const extendedDescriptionSchema = v.object({
  updated_at: datetimeSchema,
  content: v.string(),
});

type ExtendedDescription = v.InferOutput<typeof extendedDescriptionSchema>;

export { extendedDescriptionSchema, type ExtendedDescription };
