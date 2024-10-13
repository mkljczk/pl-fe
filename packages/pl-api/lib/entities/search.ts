import * as v from 'valibot';

import { filteredArray } from './utils';

import { accountSchema, groupSchema, statusSchema, tagSchema } from '.';

/** @see {@link https://docs.joinmastodon.org/entities/Search} */
const searchSchema = v.object({
  accounts: filteredArray(accountSchema),
  statuses: filteredArray(statusSchema),
  hashtags: filteredArray(tagSchema),
  groups: filteredArray(groupSchema),
});

type Search = v.InferOutput<typeof searchSchema>;

export { searchSchema, type Search };
