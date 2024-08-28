import { z } from 'zod';

import { Resolve } from '../utils/types';

import { statusSchema } from './status';

/** @see {@link https://docs.joinmastodon.org/entities/Context/} */
const contextSchema = z.object({
  ancestors: z.array(statusSchema),
  descendants: z.array(statusSchema),
});

type Context = Resolve<z.infer<typeof contextSchema>>;

export { contextSchema, type Context };
