import { List as ImmutableList } from 'immutable';

import { normalizeFilter } from 'soapbox/normalizers';

import { FILTERS_FETCH_SUCCESS } from '../actions/filters';

import type { AnyAction } from 'redux';
import type { APIEntity, Filter as FilterEntity } from 'soapbox/types/entities';

type State = ImmutableList<FilterEntity>;

const importFilters = (_state: State, filters: APIEntity[]): State =>
  ImmutableList(filters.map((filter) => normalizeFilter(filter)));

const filters = (state: State = ImmutableList(), action: AnyAction): State => {
  switch (action.type) {
    case FILTERS_FETCH_SUCCESS:
      return importFilters(state, action.filters);
    default:
      return state;
  }
};

export { filters as default };
