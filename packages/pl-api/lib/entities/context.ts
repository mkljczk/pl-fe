import * as v from 'valibot';

import { statusSchema } from './status';

/** @see {@link https://docs.joinmastodon.org/entities/Context/} */
const contextSchema = v.object({
  ancestors: z.array(statusSchema),
  descendants: z.array(statusSchema),
});

type Context = v.InferOutput<typeof contextSchema>;

export { contextSchema, type Context };
