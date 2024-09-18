import { Map as ImmutableMap } from 'immutable';

import {
  LISTS_FETCH_SUCCESS,
  LIST_CREATE_SUCCESS,
  LIST_DELETE_SUCCESS,
  LIST_FETCH_FAIL,
  LIST_FETCH_SUCCESS,
  LIST_UPDATE_SUCCESS,
} from 'pl-fe/actions/lists';

import type { List } from 'pl-api';
import type { AnyAction } from 'redux';

type State = ImmutableMap<string, List | false>;

const initialState: State = ImmutableMap();

const importList = (state: State, list: List) => state.set(list.id, list);

const importLists = (state: State, lists: Array<List>) => {
  lists.forEach((list) => {
    state = importList(state, list);
  });

  return state;
};

const lists = (state: State = initialState, action: AnyAction) => {
  switch (action.type) {
    case LIST_FETCH_SUCCESS:
    case LIST_CREATE_SUCCESS:
    case LIST_UPDATE_SUCCESS:
      return importList(state, action.list);
    case LISTS_FETCH_SUCCESS:
      return importLists(state, action.lists);
    case LIST_DELETE_SUCCESS:
    case LIST_FETCH_FAIL:
      return state.set(action.listId, false);
    default:
      return state;
  }
};

export { lists as default };
