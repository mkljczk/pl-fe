import * as v from 'valibot';

import { filterSchema } from './filter';

/** @see {@link https://docs.joinmastodon.org/entities/FilterResult/} */
const filterResultSchema = v.object({
  filter: filterSchema,
  keyword_matches: z.array(v.string()).nullable().catch(null),
  status_matches: z.array(v.string()).nullable().catch(null),
});

type FilterResult = v.InferOutput<typeof filterResultSchema>;

export { filterResultSchema, type FilterResult };
