import {
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';

import {
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_UNBLOCK_SUCCESS,
  type DomainBlocksAction,
} from '../actions/domain-blocks';

import type { PaginatedResponse } from 'pl-api';

const BlocksRecord = ImmutableRecord({
  items: ImmutableOrderedSet<string>(),
  next: null as (() => Promise<PaginatedResponse<string>>) | null,
});

const ReducerRecord = ImmutableRecord({
  blocks: BlocksRecord(),
});

type State = ReturnType<typeof ReducerRecord>;

const domainLists = (
  state: State = ReducerRecord(),
  action: DomainBlocksAction,
) => {
  switch (action.type) {
    case DOMAIN_BLOCKS_FETCH_SUCCESS:
      return state
        .setIn(['blocks', 'items'], ImmutableOrderedSet(action.domains))
        .setIn(['blocks', 'next'], action.next);
    case DOMAIN_BLOCKS_EXPAND_SUCCESS:
      return state
        .updateIn(['blocks', 'items'], (set) =>
          (set as ImmutableOrderedSet<string>).union(action.domains),
        )
        .setIn(['blocks', 'next'], action.next);
    case DOMAIN_UNBLOCK_SUCCESS:
      return state.updateIn(['blocks', 'items'], (set) =>
        (set as ImmutableOrderedSet<string>).delete(action.domain),
      );
    default:
      return state;
  }
};

export { domainLists as default };
