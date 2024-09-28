import { Record as ImmutableRecord } from 'immutable';
import { combineReducers } from 'redux-immutable';

import * as BuildConfig from 'pl-fe/build-config';
import entities from 'pl-fe/entity-store/reducer';

import accounts_meta from './accounts-meta';
import admin from './admin';
import admin_user_index from './admin-user-index';
import aliases from './aliases';
import auth from './auth';
import backups from './backups';
import compose from './compose';
import contexts from './contexts';
import conversations from './conversations';
import custom_emojis from './custom-emojis';
import domain_lists from './domain-lists';
import draft_statuses from './draft-statuses';
import filters from './filters';
import followed_tags from './followed-tags';
import history from './history';
import instance from './instance';
import listAdder from './list-adder';
import listEditor from './list-editor';
import lists from './lists';
import locations from './locations';
import me from './me';
import meta from './meta';
import mutes from './mutes';
import notifications from './notifications';
import onboarding from './onboarding';
import pending_statuses from './pending-statuses';
import plfe from './pl-fe';
import polls from './polls';
import profile_hover_card from './profile-hover-card';
import push_notifications from './push-notifications';
import scheduled_statuses from './scheduled-statuses';
import search from './search';
import security from './security';
import settings from './settings';
import sidebar from './sidebar';
import status_hover_card from './status-hover-card';
import status_lists from './status-lists';
import statuses from './statuses';
import suggestions from './suggestions';
import tags from './tags';
import timelines from './timelines';
import trending_statuses from './trending-statuses';
import trends from './trends';
import user_lists from './user-lists';

const reducers = {
  accounts_meta,
  admin,
  admin_user_index,
  aliases,
  auth,
  backups,
  compose,
  contexts,
  conversations,
  custom_emojis,
  domain_lists,
  draft_statuses,
  entities,
  filters,
  followed_tags,
  history,
  instance,
  listAdder,
  listEditor,
  lists,
  locations,
  me,
  meta,
  mutes,
  notifications,
  onboarding,
  pending_statuses,
  plfe,
  polls,
  profile_hover_card,
  push_notifications,
  scheduled_statuses,
  search,
  security,
  settings,
  sidebar,
  status_hover_card,
  status_lists,
  statuses,
  suggestions,
  tags,
  timelines,
  trending_statuses,
  trends,
  user_lists,
};

// Build a default state from all reducers: it has the key and `undefined`
const StateRecord = ImmutableRecord(
  Object.keys(reducers).reduce((params: Record<string, any>, reducer) => {
    params[reducer] = undefined;
    return params;
  }, {}),
);

const appReducer = combineReducers(reducers, StateRecord);

// Clear the state (mostly) when the user logs out
const logOut = (state: any = StateRecord()): ReturnType<typeof appReducer> => {
  if (BuildConfig.NODE_ENV === 'production') {
    location.href = '/login';
  }

  const whitelist: string[] = ['instance', 'plfe', 'custom_emojis', 'auth'];

  return StateRecord(
    whitelist.reduce((acc: Record<string, any>, curr) => {
      acc[curr] = state.get(curr);
      return acc;
    }, {}),
  ) as unknown as ReturnType<typeof appReducer>;
};

const rootReducer: typeof appReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOGGED_OUT':
      return appReducer(logOut(state), action);
    default:
      return appReducer(state, action);
  }
};

export {
  StateRecord,
  rootReducer as default,
};
