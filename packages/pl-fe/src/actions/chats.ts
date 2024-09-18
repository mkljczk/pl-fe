import { changeSetting, getSettings } from 'pl-fe/actions/settings';

import type { AppDispatch, RootState } from 'pl-fe/store';

const toggleMainWindow =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const main = getSettings(getState()).getIn(['chats', 'mainWindow']) as
      | 'minimized'
      | 'open';
    const state = main === 'minimized' ? 'open' : 'minimized';
    return dispatch(changeSetting(['chats', 'mainWindow'], state));
  };

export { toggleMainWindow };
