import {
  OrderedSet as ImmutableOrderedSet,
  Record as ImmutableRecord,
} from 'immutable';

import {
  COMPOSE_DIRECT,
  COMPOSE_MENTION,
  COMPOSE_QUOTE,
  COMPOSE_REPLY,
  type ComposeAction,
} from '../actions/compose';
import {
  SEARCH_ACCOUNT_SET,
  SEARCH_CLEAR,
  SEARCH_EXPAND_REQUEST,
  SEARCH_EXPAND_SUCCESS,
  SEARCH_FETCH_REQUEST,
  SEARCH_FETCH_SUCCESS,
  SEARCH_FILTER_SET,
  SEARCH_RESULTS_CLEAR,
  SEARCH_SHOW,
  type SearchAction,
} from '../actions/search';

import type { Search, Tag } from 'pl-api';

const ResultsRecord = ImmutableRecord({
  accounts: ImmutableOrderedSet<string>(),
  statuses: ImmutableOrderedSet<string>(),
  groups: ImmutableOrderedSet<string>(),
  hashtags: ImmutableOrderedSet<Tag>(), // it's a list of maps
  accountsHasMore: false,
  statusesHasMore: false,
  groupsHasMore: false,
  hashtagsHasMore: false,
  accountsLoaded: false,
  statusesLoaded: false,
  groupsLoaded: false,
  hashtagsLoaded: false,
});

const ReducerRecord = ImmutableRecord({
  submitted: false,
  submittedValue: '',
  hidden: false,
  results: ResultsRecord(),
  filter: 'accounts' as SearchFilter,
  accountId: null as string | null,
});

type State = ReturnType<typeof ReducerRecord>;
type SearchFilter = 'accounts' | 'statuses' | 'groups' | 'hashtags' | 'links';

const toIds = (items: Array<{ id: string }> = []) =>
  ImmutableOrderedSet(items.map((item) => item.id));

const importResults = (
  state: State,
  results: Search,
  searchTerm: string,
  searchType: SearchFilter,
) =>
  state.withMutations((state) => {
    if (state.submittedValue === searchTerm && state.filter === searchType) {
      state.set(
        'results',
        ResultsRecord({
          accounts: toIds(results.accounts),
          statuses: toIds(results.statuses),
          groups: toIds(results.groups),
          hashtags: ImmutableOrderedSet(results.hashtags), // it's a list of records
          accountsHasMore: results.accounts.length !== 0,
          statusesHasMore: results.statuses.length !== 0,
          groupsHasMore: results.groups?.length !== 0,
          hashtagsHasMore: results.hashtags.length !== 0,
          accountsLoaded: true,
          statusesLoaded: true,
          groupsLoaded: true,
          hashtagsLoaded: true,
        }),
      );

      state.set('submitted', true);
    }
  });

const paginateResults = (
  state: State,
  searchType: Exclude<SearchFilter, 'links'>,
  results: Search,
  searchTerm: string,
) =>
  state.withMutations((state) => {
    if (state.submittedValue === searchTerm) {
      state.setIn(
        ['results', `${searchType}HasMore`],
        results[searchType].length >= 20,
      );
      state.setIn(['results', `${searchType}Loaded`], true);
      state.updateIn(['results', searchType], (items) => {
        const data = results[searchType];
        // Hashtags are a list of maps. Others are IDs.
        if (searchType === 'hashtags') {
          return (items as ImmutableOrderedSet<Tag>).concat(
            data as Search['hashtags'],
          );
        } else {
          return (items as ImmutableOrderedSet<string>).concat(
            toIds(data as Search['accounts']),
          );
        }
      });
    }
  });

const handleSubmitted = (state: State, value: string) =>
  state.withMutations((state) => {
    state.set('results', ResultsRecord());
    state.set('submitted', true);
    state.set('submittedValue', value);
  });

const search = (
  state = ReducerRecord(),
  action: SearchAction | ComposeAction,
) => {
  switch (action.type) {
    case SEARCH_CLEAR:
      return ReducerRecord();
    case SEARCH_RESULTS_CLEAR:
      return state.merge({
        results: ResultsRecord(),
        submitted: false,
        submittedValue: '',
      });
    case SEARCH_SHOW:
      return state.set('hidden', false);
    case COMPOSE_REPLY:
    case COMPOSE_MENTION:
    case COMPOSE_DIRECT:
    case COMPOSE_QUOTE:
      return state.set('hidden', true);
    case SEARCH_FETCH_REQUEST:
      return handleSubmitted(state, action.value);
    case SEARCH_FETCH_SUCCESS:
      return importResults(
        state,
        action.results,
        action.searchTerm,
        action.searchType,
      );
    case SEARCH_FILTER_SET:
      return state.set('filter', action.value);
    case SEARCH_EXPAND_REQUEST:
      return state.setIn(['results', `${action.searchType}Loaded`], false);
    case SEARCH_EXPAND_SUCCESS:
      return paginateResults(
        state,
        action.searchType,
        action.results,
        action.searchTerm,
      );
    case SEARCH_ACCOUNT_SET:
      if (!action.accountId)
        return state.merge({
          results: ResultsRecord(),
          submitted: false,
          submittedValue: '',
          filter: 'accounts',
          accountId: null,
        });
      return ReducerRecord({ accountId: action.accountId, filter: 'statuses' });
    default:
      return state;
  }
};

export { type SearchFilter, search as default };
