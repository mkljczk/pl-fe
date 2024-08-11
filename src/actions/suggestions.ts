import { isLoggedIn } from 'soapbox/utils/auth';

import { getClient } from '../api';

import { fetchRelationships } from './accounts';
import { importFetchedAccounts } from './importer';
import { insertSuggestionsIntoTimeline } from './timelines';

import type { AppDispatch, RootState } from 'soapbox/store';

const SUGGESTIONS_FETCH_REQUEST = 'SUGGESTIONS_FETCH_REQUEST' as const;
const SUGGESTIONS_FETCH_SUCCESS = 'SUGGESTIONS_FETCH_SUCCESS' as const;
const SUGGESTIONS_FETCH_FAIL = 'SUGGESTIONS_FETCH_FAIL' as const;

const SUGGESTIONS_DISMISS = 'SUGGESTIONS_DISMISS' as const;

const fetchSuggestions = (limit = 50) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);
    const me = state.me;

    if (!me) return null;

    if (client.features.suggestions) {
      dispatch({ type: SUGGESTIONS_FETCH_REQUEST });

      return getClient(getState).myAccount.getSuggestions(limit).then((suggestions) => {
        const accounts = suggestions.map(({ account }) => account);

        dispatch(importFetchedAccounts(accounts));
        dispatch({ type: SUGGESTIONS_FETCH_SUCCESS, suggestions });

        dispatch(fetchRelationships(accounts.map(({ id }) => id)));
        return suggestions;
      }).catch(error => {
        dispatch({ type: SUGGESTIONS_FETCH_FAIL, error, skipAlert: true });
        throw error;
      });
    } else {
      // Do nothing
      return null;
    }
  };

const fetchSuggestionsForTimeline = () => (dispatch: AppDispatch) => {
  dispatch(fetchSuggestions(20))?.then(() => dispatch(insertSuggestionsIntoTimeline()));
};

const dismissSuggestion = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({
      type: SUGGESTIONS_DISMISS,
      accountId,
    });

    return getClient(getState).myAccount.dismissSuggestions(accountId);
  };

export {
  SUGGESTIONS_FETCH_REQUEST,
  SUGGESTIONS_FETCH_SUCCESS,
  SUGGESTIONS_FETCH_FAIL,
  SUGGESTIONS_DISMISS,
  fetchSuggestions,
  fetchSuggestionsForTimeline,
  dismissSuggestion,
};
