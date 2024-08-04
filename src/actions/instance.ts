import { getAuthUserUrl, getMeUrl } from 'soapbox/utils/auth';

import { getClient } from '../api';

import type { AppDispatch, RootState } from 'soapbox/store';

const INSTANCE_FETCH_FAIL = 'INSTANCE_FETCH_FAIL' as const;
const INSTANCE_FETCH_SUCCESS = 'INSTANCE_FETCH_SUCCESS' as const;

/** Figure out the appropriate instance to fetch depending on the state */
const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state) as string;

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

const fetchInstance = () => async (dispatch: AppDispatch, getState: () => RootState) => {
  try {
    const instance = await getClient(getState).instance.getInstance();

    dispatch({ type: INSTANCE_FETCH_SUCCESS, instance });
  } catch (error) {
    dispatch({ type: INSTANCE_FETCH_FAIL, error });
  }
};

export {
  INSTANCE_FETCH_FAIL,
  INSTANCE_FETCH_SUCCESS,
  getHost,
  fetchInstance,
};
