import z from 'zod';

import { accountSchema } from './account';
import { filteredArray } from './utils';

/** @see {@link https://docs.joinmastodon.org/entities/FamiliarFollowers/} */
const familiarFollowersSchema = z.object({
  id: z.string(),
  accounts: filteredArray(accountSchema),
});

type FamiliarFollowers = z.infer<typeof familiarFollowersSchema>

export { familiarFollowersSchema, type FamiliarFollowers };
