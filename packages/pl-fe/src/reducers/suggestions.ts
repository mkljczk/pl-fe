import { OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord } from 'immutable';

import { ACCOUNT_BLOCK_SUCCESS, ACCOUNT_MUTE_SUCCESS } from 'soapbox/actions/accounts';
import { DOMAIN_BLOCK_SUCCESS } from 'soapbox/actions/domain-blocks';
import {
  SUGGESTIONS_FETCH_REQUEST,
  SUGGESTIONS_FETCH_SUCCESS,
  SUGGESTIONS_FETCH_FAIL,
  SUGGESTIONS_DISMISS,
} from 'soapbox/actions/suggestions';

import type { Suggestion as SuggestionEntity } from 'pl-api';
import type { AnyAction } from 'redux';

const SuggestionRecord = ImmutableRecord({
  source: '',
  account: '',
});

const ReducerRecord = ImmutableRecord({
  items: ImmutableOrderedSet<Suggestion>(),
  isLoading: false,
});

type State = ReturnType<typeof ReducerRecord>;
type Suggestion = ReturnType<typeof SuggestionRecord>;

const importSuggestions = (state: State, suggestions: SuggestionEntity[]) =>
  state.withMutations(state => {
    state.update('items', items => items.concat(suggestions.map(x => ({ ...x, account: x.account.id })).map(suggestion => SuggestionRecord(suggestion))));
    state.set('isLoading', false);
  });

const dismissAccount = (state: State, accountId: string) =>
  state.update('items', items => items.filterNot(item => item.account === accountId));

const dismissAccounts = (state: State, accountIds: string[]) =>
  state.update('items', items => items.filterNot(item => accountIds.includes(item.account)));

const suggestionsReducer = (state: State = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case SUGGESTIONS_FETCH_REQUEST:
      return state.set('isLoading', true);
    case SUGGESTIONS_FETCH_SUCCESS:
      return importSuggestions(state, action.suggestions);
    case SUGGESTIONS_FETCH_FAIL:
      return state.set('isLoading', false);
    case SUGGESTIONS_DISMISS:
      return dismissAccount(state, action.accountId);
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return dismissAccount(state, action.relationship.id);
    case DOMAIN_BLOCK_SUCCESS:
      return dismissAccounts(state, action.accounts);
    default:
      return state;
  }
};

export { suggestionsReducer as default };
