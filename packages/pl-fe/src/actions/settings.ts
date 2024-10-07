import { defineMessage } from 'react-intl';

import { patchMe } from 'pl-fe/actions/me';
import { getClient } from 'pl-fe/api';
import messages from 'pl-fe/messages';
import { makeGetAccount } from 'pl-fe/selectors';
import KVStore from 'pl-fe/storage/kv-store';
import { useSettingsStore } from 'pl-fe/stores/settings';
import toast from 'pl-fe/toast';
import { isLoggedIn } from 'pl-fe/utils/auth';

import type { AppDispatch, RootState } from 'pl-fe/store';

const FE_NAME = 'pl_fe';

const getAccount = makeGetAccount();

/** Options when changing/saving settings. */
type SettingOpts = {
  /** Whether to display an alert when settings are saved. */
  showAlert?: boolean;
}

const saveSuccessMessage = defineMessage({ id: 'settings.save.success', defaultMessage: 'Your preferences have been saved!' });

// const defaultSettings = ImmutableMap({
//   onboarded: false,
//   skinTone: 1,
//   reduceMotion: false,
//   underlineLinks: false,
//   autoPlayGif: true,
//   displayMedia: 'default',
//   displaySpoilers: false,
//   unfollowModal: true,
//   boostModal: false,
//   deleteModal: true,
//   missingDescriptionModal: true,
//   defaultPrivacy: 'public',
//   defaultContentType: 'text/plain',
//   themeMode: 'system',
//   locale: navigator.language || 'en',
//   showExplanationBox: true,
//   explanationBox: true,
//   autoloadTimelines: true,
//   autoloadMore: false,
//   preserveSpoilers: true,
//   autoTranslate: false,
//   knownLanguages: ImmutableOrderedSet(),

//   systemFont: false,
//   demetricator: false,

//   isDeveloper: false,

//   chats: ImmutableMap({
//     panes: ImmutableList(),
//     mainWindow: 'minimized',
//     sound: true,
//   }),

//   home: ImmutableMap({
//     shows: ImmutableMap({
//       reblog: true,
//       reply: true,
//       direct: false,
//     }),
//   }),

//   notifications: ImmutableMap({
//     quickFilter: ImmutableMap({
//       active: 'all',
//       show: true,
//       advanced: false,
//     }),

//     sounds: ImmutableMap({
//       follow: false,
//       follow_request: false,
//       favourite: false,
//       reblog: false,
//       mention: false,
//       poll: false,
//       move: false,
//       emoji_reaction: false,
//     }),
//   }),

//   'public:local': ImmutableMap({
//     shows: ImmutableMap({
//       reblog: false,
//       reply: true,
//       direct: false,
//     }),
//     other: ImmutableMap({
//       onlyMedia: false,
//     }),
//   }),

//   public: ImmutableMap({
//     shows: ImmutableMap({
//       reblog: true,
//       reply: true,
//       direct: false,
//     }),
//     other: ImmutableMap({
//       onlyMedia: false,
//     }),
//   }),

//   direct: ImmutableMap({
//   }),

//   account_timeline: ImmutableMap({
//     shows: ImmutableMap({
//       reblog: true,
//       pinned: true,
//       direct: false,
//     }),
//   }),

//   trends: ImmutableMap({
//     show: true,
//   }),

//   remote_timeline: ImmutableMap({
//     pinnedHosts: ImmutableList(),
//   }),
// });

const changeSetting = (path: string[], value: any, opts?: SettingOpts) =>
  (dispatch: AppDispatch) => {
    useSettingsStore.getState().changeSetting(path, value);
    return dispatch(saveSettings(opts));
  };

const saveSettings = (opts?: SettingOpts) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const { userSettings, userSettingsSaving } = useSettingsStore.getState();
    if (userSettings.saved) return;

    const { saved, ...data } = userSettings;

    dispatch(updateSettingsStore(data)).then(() => {
      userSettingsSaving();

      if (opts?.showAlert) {
        toast.success(saveSuccessMessage);
      }
    }).catch(error => {
      toast.showAlertForError(error);
    });
  };

/** Update settings store for Mastodon, etc. */
const updateAuthAccount = (url: string, settings: any) => {
  const key = `authAccount:${url}`;
  return KVStore.getItem(key).then((oldAccount: any) => {
    if (!oldAccount) return;
    if (!oldAccount.settings_store) oldAccount.settings_store = {};
    oldAccount.settings_store[FE_NAME] = settings;
    KVStore.setItem(key, oldAccount);
  }).catch(console.error);
};

const updateSettingsStore = (settings: any) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const client = getClient(state);

    if (client.features.settingsStore) {
      return dispatch(patchMe({
        settings_store: {
          [FE_NAME]: settings,
        },
      }));
    } else {
      const accountUrl = getAccount(state, state.me as string)!.url;

      return updateAuthAccount(accountUrl, settings);
    }
  };

const getLocale = (fallback = 'en') => {
  const localeWithVariant = useSettingsStore.getState().settings.locale.replace('_', '-');
  const locale = localeWithVariant.split('-')[0];
  return Object.keys(messages).includes(localeWithVariant) ? localeWithVariant : Object.keys(messages).includes(locale) ? locale : fallback;
};

export {
  FE_NAME,
  changeSetting,
  saveSettings,
  updateSettingsStore,
  getLocale,
};
