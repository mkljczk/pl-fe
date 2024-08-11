import { getClient } from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const BACKUPS_FETCH_REQUEST = 'BACKUPS_FETCH_REQUEST' as const;
const BACKUPS_FETCH_SUCCESS = 'BACKUPS_FETCH_SUCCESS' as const;
const BACKUPS_FETCH_FAIL = 'BACKUPS_FETCH_FAIL' as const;

const BACKUPS_CREATE_REQUEST = 'BACKUPS_CREATE_REQUEST' as const;
const BACKUPS_CREATE_SUCCESS = 'BACKUPS_CREATE_SUCCESS' as const;
const BACKUPS_CREATE_FAIL = 'BACKUPS_CREATE_FAIL' as const;

const fetchBackups = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: BACKUPS_FETCH_REQUEST });

    return getClient(getState).settings.getBackups().then((backups) =>
      dispatch({ type: BACKUPS_FETCH_SUCCESS, backups }),
    ).catch(error => {
      dispatch({ type: BACKUPS_FETCH_FAIL, error });
    });
  };

const createBackup = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: BACKUPS_CREATE_REQUEST });
    return getClient(getState).settings.createBackup().then((backups) =>
      dispatch({ type: BACKUPS_CREATE_SUCCESS, backups }),
    ).catch(error => {
      dispatch({ type: BACKUPS_CREATE_FAIL, error });
    });
  };

export {
  BACKUPS_FETCH_REQUEST,
  BACKUPS_FETCH_SUCCESS,
  BACKUPS_FETCH_FAIL,
  BACKUPS_CREATE_REQUEST,
  BACKUPS_CREATE_SUCCESS,
  BACKUPS_CREATE_FAIL,
  fetchBackups,
  createBackup,
};
