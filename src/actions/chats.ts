import { getSettings, changeSetting } from 'soapbox/actions/settings';

import type { AppDispatch, RootState } from 'soapbox/store';

const toggleMainWindow = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const main = getSettings(getState()).getIn(['chats', 'mainWindow']) as 'minimized' | 'open';
    const state = main === 'minimized' ? 'open' : 'minimized';
    return dispatch(changeSetting(['chats', 'mainWindow'], state));
  };

export {
  toggleMainWindow,
};
