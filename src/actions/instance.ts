import { createAsyncThunk } from '@reduxjs/toolkit';
import get from 'lodash/get';
import { gte } from 'semver';

import { RootState } from 'soapbox/store';
import { getAuthUserUrl, getMeUrl } from 'soapbox/utils/auth';
import { MASTODON, parseVersion, PLEROMA, REBASED } from 'soapbox/utils/features';

import api from '../api';

/** Figure out the appropriate instance to fetch depending on the state */
const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state) as string;

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

const supportsInstanceV2 = (instance: Record<string, any>): boolean => {
  const v = parseVersion(get(instance, 'version'));
  return (v.software === MASTODON && gte(v.compatVersion, '4.0.0')) ||
    (v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.5.54'));
};

interface InstanceData {
  instance: Record<string, any>;
  host: string | null | undefined;
}

const fetchInstance = createAsyncThunk<InstanceData, InstanceData['host'], { state: RootState }>(
  'instance/fetch',
  async(host, { dispatch, getState, rejectWithValue }) => {
    try {
      const response = await api(getState)('/api/v1/instance');
      const instance = response.json;

      if (supportsInstanceV2(instance)) {
        dispatch(fetchInstanceV2(host));
      }

      return { instance, host };
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

const fetchInstanceV2 = createAsyncThunk<InstanceData, InstanceData['host'], { state: RootState }>(
  'instanceV2/fetch',
  async(host, { getState, rejectWithValue }) => {
    try {
      const response = await api(getState)('/api/v2/instance');
      const instance = response.json;

      return { instance, host };
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

export {
  getHost,
  fetchInstance,
  fetchInstanceV2,
};
