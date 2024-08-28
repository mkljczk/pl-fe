import { List as ImmutableList } from 'immutable';

import { FILTERS_FETCH_SUCCESS } from '../actions/filters';

import type { Filter } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableList<Filter>;

const importFilters = (_state: State, filters: Array<Filter>): State => ImmutableList(filters);

const filters = (state: State = ImmutableList(), action: AnyAction): State => {
  switch (action.type) {
    case FILTERS_FETCH_SUCCESS:
      return importFilters(state, action.filters);
    default:
      return state;
  }
};

export { filters as default };
