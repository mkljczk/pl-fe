import { selectAccount } from 'soapbox/selectors';
import toast from 'soapbox/toast';
import { isLoggedIn } from 'soapbox/utils/auth';

import { getClient } from '../api';

import { importFetchedAccounts } from './importer';

import type { Account, PaginatedResponse } from 'pl-api';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const LIST_FETCH_REQUEST = 'LIST_FETCH_REQUEST';
const LIST_FETCH_SUCCESS = 'LIST_FETCH_SUCCESS';
const LIST_FETCH_FAIL    = 'LIST_FETCH_FAIL';

const LISTS_FETCH_REQUEST = 'LISTS_FETCH_REQUEST';
const LISTS_FETCH_SUCCESS = 'LISTS_FETCH_SUCCESS';
const LISTS_FETCH_FAIL    = 'LISTS_FETCH_FAIL';

const LIST_EDITOR_TITLE_CHANGE = 'LIST_EDITOR_TITLE_CHANGE';
const LIST_EDITOR_RESET        = 'LIST_EDITOR_RESET';
const LIST_EDITOR_SETUP        = 'LIST_EDITOR_SETUP';

const LIST_CREATE_REQUEST = 'LIST_CREATE_REQUEST';
const LIST_CREATE_SUCCESS = 'LIST_CREATE_SUCCESS';
const LIST_CREATE_FAIL    = 'LIST_CREATE_FAIL';

const LIST_UPDATE_REQUEST = 'LIST_UPDATE_REQUEST';
const LIST_UPDATE_SUCCESS = 'LIST_UPDATE_SUCCESS';
const LIST_UPDATE_FAIL    = 'LIST_UPDATE_FAIL';

const LIST_DELETE_REQUEST = 'LIST_DELETE_REQUEST';
const LIST_DELETE_SUCCESS = 'LIST_DELETE_SUCCESS';
const LIST_DELETE_FAIL    = 'LIST_DELETE_FAIL';

const LIST_ACCOUNTS_FETCH_REQUEST = 'LIST_ACCOUNTS_FETCH_REQUEST';
const LIST_ACCOUNTS_FETCH_SUCCESS = 'LIST_ACCOUNTS_FETCH_SUCCESS';
const LIST_ACCOUNTS_FETCH_FAIL    = 'LIST_ACCOUNTS_FETCH_FAIL';

const LIST_EDITOR_SUGGESTIONS_CHANGE = 'LIST_EDITOR_SUGGESTIONS_CHANGE';
const LIST_EDITOR_SUGGESTIONS_READY  = 'LIST_EDITOR_SUGGESTIONS_READY';
const LIST_EDITOR_SUGGESTIONS_CLEAR  = 'LIST_EDITOR_SUGGESTIONS_CLEAR';

const LIST_EDITOR_ADD_REQUEST = 'LIST_EDITOR_ADD_REQUEST';
const LIST_EDITOR_ADD_SUCCESS = 'LIST_EDITOR_ADD_SUCCESS';
const LIST_EDITOR_ADD_FAIL    = 'LIST_EDITOR_ADD_FAIL';

const LIST_EDITOR_REMOVE_REQUEST = 'LIST_EDITOR_REMOVE_REQUEST';
const LIST_EDITOR_REMOVE_SUCCESS = 'LIST_EDITOR_REMOVE_SUCCESS';
const LIST_EDITOR_REMOVE_FAIL    = 'LIST_EDITOR_REMOVE_FAIL';

const LIST_ADDER_RESET = 'LIST_ADDER_RESET';
const LIST_ADDER_SETUP = 'LIST_ADDER_SETUP';

const LIST_ADDER_LISTS_FETCH_REQUEST = 'LIST_ADDER_LISTS_FETCH_REQUEST';
const LIST_ADDER_LISTS_FETCH_SUCCESS = 'LIST_ADDER_LISTS_FETCH_SUCCESS';
const LIST_ADDER_LISTS_FETCH_FAIL    = 'LIST_ADDER_LISTS_FETCH_FAIL';

const fetchList = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  if (getState().lists.get(id)) {
    return;
  }

  dispatch(fetchListRequest(id));

  return getClient(getState()).lists.getList(id)
    .then((data) => dispatch(fetchListSuccess(data)))
    .catch(err => dispatch(fetchListFail(id, err)));
};

const fetchListRequest = (id: string) => ({
  type: LIST_FETCH_REQUEST,
  id,
});

const fetchListSuccess = (list: APIEntity) => ({
  type: LIST_FETCH_SUCCESS,
  list,
});

const fetchListFail = (id: string, error: unknown) => ({
  type: LIST_FETCH_FAIL,
  id,
  error,
});

const fetchLists = () => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchListsRequest());

  return getClient(getState()).lists.getLists()
    .then((data) => dispatch(fetchListsSuccess(data)))
    .catch(err => dispatch(fetchListsFail(err)));
};

const fetchListsRequest = () => ({
  type: LISTS_FETCH_REQUEST,
});

const fetchListsSuccess = (lists: APIEntity[]) => ({
  type: LISTS_FETCH_SUCCESS,
  lists,
});

const fetchListsFail = (error: unknown) => ({
  type: LISTS_FETCH_FAIL,
  error,
});

const submitListEditor = (shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  const listId = getState().listEditor.listId!;
  const title  = getState().listEditor.title;

  if (listId === null) {
    dispatch(createList(title, shouldReset));
  } else {
    dispatch(updateList(listId, title, shouldReset));
  }
};

const setupListEditor = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({
    type: LIST_EDITOR_SETUP,
    list: getState().lists.get(String(listId)),
  });

  dispatch(fetchListAccounts(listId));
};

const changeListEditorTitle = (value: string) => ({
  type: LIST_EDITOR_TITLE_CHANGE,
  value,
});

const createList = (title: string, shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(createListRequest());

  return getClient(getState()).lists.createList({ title }).then((data) => {
    dispatch(createListSuccess(data));

    if (shouldReset) {
      dispatch(resetListEditor());
    }
  }).catch(err => dispatch(createListFail(err)));
};

const createListRequest = () => ({
  type: LIST_CREATE_REQUEST,
});

const createListSuccess = (list: APIEntity) => ({
  type: LIST_CREATE_SUCCESS,
  list,
});

const createListFail = (error: unknown) => ({
  type: LIST_CREATE_FAIL,
  error,
});

const updateList = (id: string, title: string, shouldReset?: boolean) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(updateListRequest(id));

  return getClient(getState()).lists.updateList(id, { title }).then((data) => {
    dispatch(updateListSuccess(data));

    if (shouldReset) {
      dispatch(resetListEditor());
    }
  }).catch(err => dispatch(updateListFail(id, err)));
};

const updateListRequest = (id: string) => ({
  type: LIST_UPDATE_REQUEST,
  id,
});

const updateListSuccess = (list: APIEntity) => ({
  type: LIST_UPDATE_SUCCESS,
  list,
});

const updateListFail = (id: string, error: unknown) => ({
  type: LIST_UPDATE_FAIL,
  id,
  error,
});

const resetListEditor = () => ({
  type: LIST_EDITOR_RESET,
});

const deleteList = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(deleteListRequest(id));

  return getClient(getState()).lists.deleteList(id)
    .then(() => dispatch(deleteListSuccess(id)))
    .catch(err => dispatch(deleteListFail(id, err)));
};

const deleteListRequest = (id: string) => ({
  type: LIST_DELETE_REQUEST,
  id,
});

const deleteListSuccess = (id: string) => ({
  type: LIST_DELETE_SUCCESS,
  id,
});

const deleteListFail = (id: string, error: unknown) => ({
  type: LIST_DELETE_FAIL,
  id,
  error,
});

const fetchListAccounts = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchListAccountsRequest(listId));

  return getClient(getState()).lists.getListAccounts(listId).then(({ items, next }) => {
    dispatch(importFetchedAccounts(items));
    dispatch(fetchListAccountsSuccess(listId, items, next));
  }).catch(err => dispatch(fetchListAccountsFail(listId, err)));
};

const fetchListAccountsRequest = (id: string) => ({
  type: LIST_ACCOUNTS_FETCH_REQUEST,
  id,
});

const fetchListAccountsSuccess = (id: string, accounts: Account[], next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: LIST_ACCOUNTS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchListAccountsFail = (id: string, error: unknown) => ({
  type: LIST_ACCOUNTS_FETCH_FAIL,
  id,
  error,
});

const fetchListSuggestions = (q: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  return getClient(getState()).accounts.searchAccounts(q, { resolve: false, limit: 4, following: true }).then((data) => {
    dispatch(importFetchedAccounts(data));
    dispatch(fetchListSuggestionsReady(q, data));
  }).catch(error => toast.showAlertForError(error));
};

const fetchListSuggestionsReady = (query: string, accounts: APIEntity[]) => ({
  type: LIST_EDITOR_SUGGESTIONS_READY,
  query,
  accounts,
});

const clearListSuggestions = () => ({
  type: LIST_EDITOR_SUGGESTIONS_CLEAR,
});

const changeListSuggestions = (value: string) => ({
  type: LIST_EDITOR_SUGGESTIONS_CHANGE,
  value,
});

const addToListEditor = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addToList(getState().listEditor.listId!, accountId));
};

const addToList = (listId: string, accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(addToListRequest(listId, accountId));

  return getClient(getState()).lists.addListAccounts(listId, [accountId])
    .then(() => dispatch(addToListSuccess(listId, accountId)))
    .catch(err => dispatch(addToListFail(listId, accountId, err)));
};

const addToListRequest = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_ADD_REQUEST,
  listId,
  accountId,
});

const addToListSuccess = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_ADD_SUCCESS,
  listId,
  accountId,
});

const addToListFail = (listId: string, accountId: string, error: APIEntity) => ({
  type: LIST_EDITOR_ADD_FAIL,
  listId,
  accountId,
  error,
});

const removeFromListEditor = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeFromList(getState().listEditor.listId!, accountId));
};

const removeFromList = (listId: string, accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(removeFromListRequest(listId, accountId));

  return getClient(getState()).lists.deleteListAccounts(listId, [accountId])
    .then(() => dispatch(removeFromListSuccess(listId, accountId)))
    .catch(err => dispatch(removeFromListFail(listId, accountId, err)));
};

const removeFromListRequest = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_REMOVE_REQUEST,
  listId,
  accountId,
});

const removeFromListSuccess = (listId: string, accountId: string) => ({
  type: LIST_EDITOR_REMOVE_SUCCESS,
  listId,
  accountId,
});

const removeFromListFail = (listId: string, accountId: string, error: unknown) => ({
  type: LIST_EDITOR_REMOVE_FAIL,
  listId,
  accountId,
  error,
});

const resetListAdder = () => ({
  type: LIST_ADDER_RESET,
});

const setupListAdder = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({
    type: LIST_ADDER_SETUP,
    account: selectAccount(getState(), accountId),
  });
  dispatch(fetchLists());
  dispatch(fetchAccountLists(accountId));
};

const fetchAccountLists = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  dispatch(fetchAccountListsRequest(accountId));

  return getClient(getState()).accounts.getAccountLists(accountId)
    .then((data) => dispatch(fetchAccountListsSuccess(accountId, data)))
    .catch(err => dispatch(fetchAccountListsFail(accountId, err)));
};

const fetchAccountListsRequest = (id: string) => ({
  type: LIST_ADDER_LISTS_FETCH_REQUEST,
  id,
});

const fetchAccountListsSuccess = (id: string, lists: APIEntity[]) => ({
  type: LIST_ADDER_LISTS_FETCH_SUCCESS,
  id,
  lists,
});

const fetchAccountListsFail = (id: string, err: unknown) => ({
  type: LIST_ADDER_LISTS_FETCH_FAIL,
  id,
  err,
});

const addToListAdder = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(addToList(listId, getState().listAdder.accountId!));
};

const removeFromListAdder = (listId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch(removeFromList(listId, getState().listAdder.accountId!));
};

export {
  LIST_FETCH_REQUEST,
  LIST_FETCH_SUCCESS,
  LIST_FETCH_FAIL,
  LISTS_FETCH_REQUEST,
  LISTS_FETCH_SUCCESS,
  LISTS_FETCH_FAIL,
  LIST_EDITOR_TITLE_CHANGE,
  LIST_EDITOR_RESET,
  LIST_EDITOR_SETUP,
  LIST_CREATE_REQUEST,
  LIST_CREATE_SUCCESS,
  LIST_CREATE_FAIL,
  LIST_UPDATE_REQUEST,
  LIST_UPDATE_SUCCESS,
  LIST_UPDATE_FAIL,
  LIST_DELETE_REQUEST,
  LIST_DELETE_SUCCESS,
  LIST_DELETE_FAIL,
  LIST_ACCOUNTS_FETCH_REQUEST,
  LIST_ACCOUNTS_FETCH_SUCCESS,
  LIST_ACCOUNTS_FETCH_FAIL,
  LIST_EDITOR_SUGGESTIONS_CHANGE,
  LIST_EDITOR_SUGGESTIONS_READY,
  LIST_EDITOR_SUGGESTIONS_CLEAR,
  LIST_EDITOR_ADD_REQUEST,
  LIST_EDITOR_ADD_SUCCESS,
  LIST_EDITOR_ADD_FAIL,
  LIST_EDITOR_REMOVE_REQUEST,
  LIST_EDITOR_REMOVE_SUCCESS,
  LIST_EDITOR_REMOVE_FAIL,
  LIST_ADDER_RESET,
  LIST_ADDER_SETUP,
  LIST_ADDER_LISTS_FETCH_REQUEST,
  LIST_ADDER_LISTS_FETCH_SUCCESS,
  LIST_ADDER_LISTS_FETCH_FAIL,
  fetchList,
  fetchListRequest,
  fetchListSuccess,
  fetchListFail,
  fetchLists,
  fetchListsRequest,
  fetchListsSuccess,
  fetchListsFail,
  submitListEditor,
  setupListEditor,
  changeListEditorTitle,
  createList,
  createListRequest,
  createListSuccess,
  createListFail,
  updateList,
  updateListRequest,
  updateListSuccess,
  updateListFail,
  resetListEditor,
  deleteList,
  deleteListRequest,
  deleteListSuccess,
  deleteListFail,
  fetchListAccounts,
  fetchListAccountsRequest,
  fetchListAccountsSuccess,
  fetchListAccountsFail,
  fetchListSuggestions,
  fetchListSuggestionsReady,
  clearListSuggestions,
  changeListSuggestions,
  addToListEditor,
  addToList,
  addToListRequest,
  addToListSuccess,
  addToListFail,
  removeFromListEditor,
  removeFromList,
  removeFromListRequest,
  removeFromListSuccess,
  removeFromListFail,
  resetListAdder,
  setupListAdder,
  fetchAccountLists,
  fetchAccountListsRequest,
  fetchAccountListsSuccess,
  fetchAccountListsFail,
  addToListAdder,
  removeFromListAdder,
};
