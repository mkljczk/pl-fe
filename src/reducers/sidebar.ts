import { SIDEBAR_OPEN, SIDEBAR_CLOSE } from '../actions/sidebar';

import type { AnyAction } from 'redux';

type State = {
  sidebarOpen: boolean;
};

const initialState: State = {
  sidebarOpen: false,
};

const sidebar = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case SIDEBAR_OPEN:
      return { sidebarOpen: true };
    case SIDEBAR_CLOSE:
      return { sidebarOpen: false };
    default:
      return state;
  }
};

export default sidebar;
