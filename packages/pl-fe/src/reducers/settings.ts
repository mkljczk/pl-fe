import { produce } from 'immer';
import { AnyAction } from 'redux';

import { settingsSchema, type Settings } from 'pl-fe/schemas/pl-fe/settings';

import { NOTIFICATIONS_FILTER_SET } from '../actions/notifications';
import { SEARCH_FILTER_SET } from '../actions/search';
import { SETTING_CHANGE } from '../actions/settings';

type State = Partial<Settings>;

// Default settings are in action/settings.js
//
// Settings should be accessed with `getSettings(getState()).getIn(...)`
// instead of directly from the state.
const settings = (
  state: State = settingsSchema.partial().parse({}),
  action: AnyAction,
): State => {
  switch (action.type) {
    case NOTIFICATIONS_FILTER_SET:
    case SEARCH_FILTER_SET:
    case SETTING_CHANGE:
      return produce(state, draft => {
        // @ts-ignore
        draft[action.path] = action.value;
        draft.saved = false;
      });
    default:
      return state;
  }
};

export { settings as default };
