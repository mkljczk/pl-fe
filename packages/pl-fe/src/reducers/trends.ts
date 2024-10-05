import { Record as ImmutableRecord } from 'immutable';

import { TRENDS_FETCH_SUCCESS, type TrendsAction } from '../actions/trends';

import type { Tag } from 'pl-api';

const ReducerRecord = ImmutableRecord({
  items: Array<Tag>(),
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;

const trendsReducer = (state: State = ReducerRecord(), action: TrendsAction) => {
  switch (action.type) {
    case TRENDS_FETCH_SUCCESS:
      return state.withMutations(map => {
        map.set('items', action.tags);
        map.set('isLoading', false);
      });
    default:
      return state;
  }
};

export { trendsReducer as default };
