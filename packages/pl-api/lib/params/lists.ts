import type { PaginationParams } from './common';

interface CreateListParams {
  /** String. The title of the list to be created. */
  title: string;
  /** String. One of followed, list, or none. Defaults to list. */
  replies_policy?: 'followed' | 'list' | 'none';
  /** Boolean. Whether members of this list need to get removed from the “Home” feed */
  exclusive?: boolean;
}

type UpdateListParams = CreateListParams;
type GetListAccountsParams = PaginationParams;

export type {
  CreateListParams,
  UpdateListParams,
  GetListAccountsParams,
};
