import { Record as ImmutableRecord } from 'immutable';

import {
  INSTANCE_FETCH_FAIL,
  type InstanceAction,
} from 'pl-fe/actions/instance';
import { SW_UPDATING, type SwAction } from 'pl-fe/actions/sw';

const ReducerRecord = ImmutableRecord({
  /** Whether /api/v1/instance 404'd (and we should display the external auth form). */
  instance_fetch_failed: false,
  /** Whether the ServiceWorker is currently updating (and we should display a loading screen). */
  swUpdating: false,
});

const meta = (state = ReducerRecord(), action: InstanceAction | SwAction) => {
  switch (action.type) {
    case INSTANCE_FETCH_FAIL:
      if (action.error?.response?.status === 404) {
        return state.set('instance_fetch_failed', true);
      }
      return state;
    case SW_UPDATING:
      return state.set('swUpdating', action.isUpdating);
    default:
      return state;
  }
};

export { meta as default };
