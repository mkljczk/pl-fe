import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import {
  ALIASES_SUGGESTIONS_READY,
  ALIASES_SUGGESTIONS_CLEAR,
  ALIASES_SUGGESTIONS_CHANGE,
  ALIASES_FETCH_SUCCESS,
  AliasesAction,
} from '../actions/aliases';

const ReducerRecord = ImmutableRecord({
  aliases: ImmutableRecord({
    items: ImmutableList<string>(),
    loaded: false,
  })(),
  suggestions: ImmutableRecord({
    items: ImmutableList<string>(),
    value: '',
    loaded: false,
  })(),
});

const aliasesReducer = (state = ReducerRecord(), action: AliasesAction) => {
  switch (action.type) {
    case ALIASES_FETCH_SUCCESS:
      return state
        .setIn(['aliases', 'items'], action.value);
    case ALIASES_SUGGESTIONS_CHANGE:
      return state
        .setIn(['suggestions', 'value'], action.value)
        .setIn(['suggestions', 'loaded'], false);
    case ALIASES_SUGGESTIONS_READY:
      return state
        .setIn(['suggestions', 'items'], ImmutableList(action.accounts.map((item) => item.id)))
        .setIn(['suggestions', 'loaded'], true);
    case ALIASES_SUGGESTIONS_CLEAR:
      return state.update('suggestions', suggestions => suggestions.withMutations(map => {
        map.set('items', ImmutableList());
        map.set('value', '');
        map.set('loaded', false);
      }));
    default:
      return state;
  }
};

export { aliasesReducer as default };
