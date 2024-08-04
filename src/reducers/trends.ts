import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import { normalizeTag } from 'soapbox/normalizers';

import { TRENDS_FETCH_SUCCESS } from '../actions/trends';

import type { AnyAction } from 'redux';
import type { APIEntity, Tag } from 'soapbox/types/entities';

const ReducerRecord = ImmutableRecord({
  items: ImmutableList<Tag>(),
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;

const trendsReducer = (state: State = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case TRENDS_FETCH_SUCCESS:
      return state.withMutations(map => {
        map.set('items', ImmutableList(action.tags.map((item: APIEntity) => normalizeTag(item))));
        map.set('isLoading', false);
      });
    default:
      return state;
  }
};

export { trendsReducer as default };
