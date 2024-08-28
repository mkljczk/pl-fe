import { Map as ImmutableMap } from 'immutable';

import { POLLS_IMPORT } from 'soapbox/actions/importer';
import { normalizePoll } from 'soapbox/normalizers';

import type { Status } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableMap<string, ReturnType<typeof normalizePoll>>;

const importPolls = (state: State, polls: Array<Exclude<Status['poll'], null>>) =>
  state.withMutations(map =>
    polls.forEach(poll => map.set(poll.id, normalizePoll(poll))),
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
