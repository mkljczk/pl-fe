import { Map as ImmutableMap } from 'immutable';

import { POLLS_IMPORT } from 'pl-fe/actions/importer';

import type { Poll, Status } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableMap<string, Poll>;

const importPolls = (state: State, polls: Array<Exclude<Status['poll'], null>>) =>
  state.withMutations(map =>
    polls.forEach(poll => map.set(poll.id, poll)),
  );

const initialState: State = ImmutableMap();

const polls = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case POLLS_IMPORT:
      return importPolls(state, action.polls);
    default:
      return state;
  }
};

export { polls as default };
