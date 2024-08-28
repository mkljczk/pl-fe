import { z } from 'zod';

import { filteredArray } from './utils';

import { accountSchema, groupSchema, statusSchema, tagSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/Search} */
const searchSchema = z.object({
  accounts: filteredArray(accountSchema),
  statuses: filteredArray(statusSchema),
  hashtags: filteredArray(tagSchema),
  groups: filteredArray(groupSchema),
});

type Search = z.infer<typeof searchSchema>;

export { searchSchema, type Search };
