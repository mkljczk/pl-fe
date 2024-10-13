import * as v from 'valibot';

import { filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/FilterKeyword/} */
const filterKeywordSchema = v.object({
  id: v.string(),
  keyword: v.string(),
  whole_word: v.boolean(),
});

/** @see {@link https://docs.joinmastodon.org/entities/FilterStatus/} */
const filterStatusSchema = v.object({
  id: v.string(),
  status_id: v.string(),
});

/** @see {@link https://docs.joinmastodon.org/entities/Filter/} */
const filterSchema = z.preprocess((filter: any) => {
  if (filter.phrase) {
    return {
      ...filter,
      title: filter.phrase,
      keywords: [{
        id: '1',
        keyword: filter.phrase,
        whole_word: filter.whole_word,
      }],
      filter_action: filter.irreversible ? 'hide' : 'warn',
    };
  }
  return filter;
}, v.object({
  id: v.string(),
  title: v.string(),
  context: z.array(z.enum(['home', 'notifications', 'public', 'thread', 'account'])),
  expires_at: z.string().datetime({ offset: true }).nullable().catch(null),
  filter_action: z.enum(['warn', 'hide']).catch('warn'),
  keywords: filteredArray(filterKeywordSchema),
  statuses: filteredArray(filterStatusSchema),
}));

type Filter = v.InferOutput<typeof filterSchema>;

export { filterKeywordSchema, filterStatusSchema, filterSchema, type Filter };
