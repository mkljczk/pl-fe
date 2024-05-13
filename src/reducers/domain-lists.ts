import { OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord } from 'immutable';

import {
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  DOMAIN_UNBLOCK_SUCCESS,
} from '../actions/domain-blocks';

import type { AnyAction } from 'redux';

const BlocksRecord = ImmutableRecord({
  items: ImmutableOrderedSet<string>(),
  next: null as string | null,
});

const ReducerRecord = ImmutableRecord({
  blocks: BlocksRecord(),
});

type State = ReturnType<typeof ReducerRecord>;

const domainLists = (state: State = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case DOMAIN_BLOCKS_FETCH_SUCCESS:
      return state.setIn(['blocks', 'items'], ImmutableOrderedSet(action.domains)).setIn(['blocks', 'next'], action.next);
    case DOMAIN_BLOCKS_EXPAND_SUCCESS:
      return state.updateIn(['blocks', 'items'], set => (set as ImmutableOrderedSet<string>).union(action.domains)).setIn(['blocks', 'next'], action.next);
    case DOMAIN_UNBLOCK_SUCCESS:
      return state.updateIn(['blocks', 'items'], set => (set as ImmutableOrderedSet<string>).delete(action.domain));
    default:
      return state;
  }
};

export { domainLists as default };
