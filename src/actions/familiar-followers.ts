import { AppDispatch, RootState } from 'soapbox/store';

import { getClient } from '../api';

import { fetchRelationships } from './accounts';
import { importFetchedAccounts } from './importer';

import type { APIEntity } from 'soapbox/types/entities';

const FAMILIAR_FOLLOWERS_FETCH_REQUEST = 'FAMILIAR_FOLLOWERS_FETCH_REQUEST';
const FAMILIAR_FOLLOWERS_FETCH_SUCCESS = 'FAMILIAR_FOLLOWERS_FETCH_SUCCESS';
const FAMILIAR_FOLLOWERS_FETCH_FAIL    = 'FAMILIAR_FOLLOWERS_FETCH_FAIL';

const fetchAccountFamiliarFollowers = (accountId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({
    type: FAMILIAR_FOLLOWERS_FETCH_REQUEST,
    id: accountId,
  });

  getClient(getState()).accounts.getFamiliarFollowers([accountId])
    .then((data) => {
      const accounts = data.find(({ id }: { id: string }) => id === accountId)!.accounts;

      dispatch(importFetchedAccounts(accounts));
      dispatch(fetchRelationships(accounts.map((item: APIEntity) => item.id)));
      dispatch({
        type: FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
        id: accountId,
        accounts,
      });
    })
    .catch(error => dispatch({
      type: FAMILIAR_FOLLOWERS_FETCH_FAIL,
      id: accountId,
      error,
      skipAlert: true,
    }));
};

export {
  FAMILIAR_FOLLOWERS_FETCH_REQUEST,
  FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
  FAMILIAR_FOLLOWERS_FETCH_FAIL,
  fetchAccountFamiliarFollowers,
};
