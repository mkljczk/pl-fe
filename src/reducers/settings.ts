import { Map as ImmutableMap, fromJS } from 'immutable';
import { AnyAction } from 'redux';

import { LANGUAGE_USE } from 'soapbox/actions/languages';
import { ME_FETCH_SUCCESS } from 'soapbox/actions/me';

import { EMOJI_CHOOSE } from '../actions/emojis';
import { NOTIFICATIONS_FILTER_SET } from '../actions/notifications';
import { SEARCH_FILTER_SET } from '../actions/search';
import {
  SETTING_CHANGE,
  SETTING_SAVE,
  SETTINGS_UPDATE,
  FE_NAME,
} from '../actions/settings';

import type { Emoji } from 'soapbox/features/emoji';
import type { APIEntity } from 'soapbox/types/entities';

type State = ImmutableMap<string, any>;

const updateFrequentEmojis = (state: State, emoji: Emoji) =>
  state.update('frequentlyUsedEmojis', ImmutableMap(), map => map.update(emoji.id, 0, (count: number) => count + 1)).set('saved', false);

const updateFrequentLanguages = (state: State, language: string) =>
  state.update('frequentlyUsedLanguages', ImmutableMap<string, number>(), map => map.update(language, 0, (count: number) => count + 1)).set('saved', false);

const importSettings = (state: State, account: APIEntity) => {
  account = fromJS(account);
  console.log(account.toJS());
  const prefs = account.getIn(['__meta', 'pleroma', 'settings_store', FE_NAME], ImmutableMap());
  return state.merge(prefs) as State;
};

// Default settings are in action/settings.js
//
// Settings should be accessed with `getSettings(getState()).getIn(...)`
// instead of directly from the state.
const settings = (
  state: State = ImmutableMap<string, any>({ saved: true }),
  action: AnyAction,
): State => {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
      return importSettings(state, action.me);
    case NOTIFICATIONS_FILTER_SET:
    case SEARCH_FILTER_SET:
    case SETTING_CHANGE:
      return state
        .setIn(action.path, action.value)
        .set('saved', false);
    case EMOJI_CHOOSE:
      return updateFrequentEmojis(state, action.emoji);
    case LANGUAGE_USE:
      return updateFrequentLanguages(state, action.language);
    case SETTING_SAVE:
      return state.set('saved', true);
    case SETTINGS_UPDATE:
      return ImmutableMap<string, any>(fromJS(action.settings));
    default:
      return state;
  }
};

export { settings as default };
