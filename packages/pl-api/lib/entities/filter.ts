import { z } from 'zod';

import { Resolve } from '../utils/types';

import { filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/FilterKeyword/} */
const filterKeywordSchema = z.object({
  id: z.string(),
  keyword: z.string(),
  whole_word: z.boolean(),
});

/** @see {@link https://docs.joinmastodon.org/entities/FilterStatus/} */
const filterStatusSchema = z.object({
  id: z.string(),
  status_id: z.string(),
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
}, z.object({
  id: z.string(),
  title: z.string(),
  context: z.array(z.enum(['home', 'notifications', 'public', 'thread', 'account'])),
  expires_at: z.string().datetime({ offset: true }).nullable().catch(null),
  filter_action: z.enum(['warn', 'hide']).catch('warn'),
  keywords: filteredArray(filterKeywordSchema),
  statuses: filteredArray(filterStatusSchema),
}));

type Filter = Resolve<z.infer<typeof filterSchema>>;

export { filterKeywordSchema, filterStatusSchema, filterSchema, type Filter };
