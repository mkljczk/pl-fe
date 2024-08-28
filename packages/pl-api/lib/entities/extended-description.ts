import { z } from 'zod';

import { dateSchema } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/ExtendedDescription} */
const extendedDescriptionSchema = z.object({
  updated_at: dateSchema,
  content: z.string(),
});

type ExtendedDescription = z.infer<typeof extendedDescriptionSchema>;

export { extendedDescriptionSchema, type ExtendedDescription };
