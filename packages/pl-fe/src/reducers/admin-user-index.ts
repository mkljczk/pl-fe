import { OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord } from 'immutable';

import {
  ADMIN_USER_INDEX_EXPAND_FAIL,
  ADMIN_USER_INDEX_EXPAND_REQUEST,
  ADMIN_USER_INDEX_EXPAND_SUCCESS,
  ADMIN_USER_INDEX_FETCH_FAIL,
  ADMIN_USER_INDEX_FETCH_REQUEST,
  ADMIN_USER_INDEX_FETCH_SUCCESS,
  ADMIN_USER_INDEX_QUERY_SET,
} from 'pl-fe/actions/admin';

import type { AdminAccount, AdminGetAccountsParams, PaginatedResponse } from 'pl-api';
import type { APIEntity } from 'pl-fe/types/entities';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  isLoading: false,
  loaded: false,
  items: ImmutableOrderedSet<string>(),
  total: Infinity,
  page: -1,
  query: '',
  next: null as (() => Promise<PaginatedResponse<AdminAccount>>) | null,
  params: null as AdminGetAccountsParams | null,
});

type State = ReturnType<typeof ReducerRecord>;

const admin_user_index = (state: State = ReducerRecord(), action: AnyAction): State => {
  switch (action.type) {
    case ADMIN_USER_INDEX_QUERY_SET:
      return state.set('query', action.query);
    case ADMIN_USER_INDEX_FETCH_REQUEST:
      return state
        .set('isLoading', true)
        .set('loaded', true)
        .set('items', ImmutableOrderedSet())
        .set('total', action.total)
        .set('page', 0)
        .set('next', null);
    case ADMIN_USER_INDEX_FETCH_SUCCESS:
      return state
        .set('isLoading', false)
        .set('loaded', true)
        .set('items', ImmutableOrderedSet(action.users.map((user: APIEntity) => user.id)))
        .set('total', action.total)
        .set('page', 1)
        .set('next', action.next);
    case ADMIN_USER_INDEX_FETCH_FAIL:
    case ADMIN_USER_INDEX_EXPAND_FAIL:
      return state
        .set('isLoading', false);
    case ADMIN_USER_INDEX_EXPAND_REQUEST:
      return state
        .set('isLoading', true);
    case ADMIN_USER_INDEX_EXPAND_SUCCESS:
      return state
        .set('isLoading', false)
        .set('loaded', true)
        .set('items', state.items.union(action.users.map((user: APIEntity) => user.id)))
        .set('total', action.total)
        .set('page', 1)
        .set('next', action.next);
    default:
      return state;
  }
};

export { admin_user_index as default };
