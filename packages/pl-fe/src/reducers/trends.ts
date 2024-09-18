import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import { TRENDS_FETCH_SUCCESS } from '../actions/trends';

import type { Tag } from 'pl-api';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<Tag>(),
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;

const trendsReducer = (state: State = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case TRENDS_FETCH_SUCCESS:
      return state.withMutations((map) => {
        map.set('items', ImmutableList(action.tags));
        map.set('isLoading', false);
      });
    default:
      return state;
  }
};

export { trendsReducer as default };
