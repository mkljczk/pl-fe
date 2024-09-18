import { register, saveSettings } from './registerer';
import {
  CLEAR_SUBSCRIPTION,
  SET_ALERTS,
  SET_BROWSER_SUPPORT,
  SET_SUBSCRIPTION,
  setAlerts,
} from './setter';

import type { AppDispatch } from 'pl-fe/store';

const changeAlerts =
  (path: Array<string>, value: any) => (dispatch: AppDispatch) => {
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
