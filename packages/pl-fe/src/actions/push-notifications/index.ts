import { register, saveSettings } from './registerer';
import {
  SET_BROWSER_SUPPORT,
  SET_SUBSCRIPTION,
  CLEAR_SUBSCRIPTION,
  SET_ALERTS,
  setAlerts,
} from './setter';

import type { AppDispatch } from 'soapbox/store';

const changeAlerts = (path: Array<string>, value: any) =>
  (dispatch: AppDispatch) => {
    dispatch(setAlerts(path, value));
    dispatch(saveSettings() as any);
  };

export {
  SET_BROWSER_SUPPORT,
  SET_SUBSCRIPTION,
  CLEAR_SUBSCRIPTION,
  SET_ALERTS,
  register,
  changeAlerts,
};
