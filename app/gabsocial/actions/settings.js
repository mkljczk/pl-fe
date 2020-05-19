import { debounce } from 'lodash';
import { showAlertForError } from './alerts';
import { patchMe } from 'gabsocial/actions/me';
import { Map as ImmutableMap } from 'immutable';

export const SETTING_CHANGE = 'SETTING_CHANGE';
export const SETTING_SAVE   = 'SETTING_SAVE';

export const FE_NAME = 'soapbox_fe';

const defaultSettings = ImmutableMap({
  onboarded: false,

  skinTone: 1,
  reduceMotion: false,
  autoPlayGif: false,
  displayMedia: true,
  expandSpoilers: false,
  unfollowModal: false,
  boostModal: false,
  deleteModal: true,
  defaultPrivacy: 'public',
  theme: 'azure',
  // locale: navigator.language.slice(0, 2) || 'en', // FIXME: Dynamic locales
  locale: 'en',

  systemFont: false,
  dyslexicFont: false,
  demetricator: false,

  home: ImmutableMap({
    shows: ImmutableMap({
      reblog: true,
      reply: true,
    }),

    regex: ImmutableMap({
      body: '',
    }),
  }),

  notifications: ImmutableMap({
    alerts: ImmutableMap({
      follow: true,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
    }),

    quickFilter: ImmutableMap({
      active: 'all',
      show: true,
      advanced: false,
    }),

    shows: ImmutableMap({
      follow: true,
      favourite: true,
      reblog: true,
      mention: true,
      poll: true,
    }),

    sounds: ImmutableMap({
      follow: false,
      favourite: false,
      reblog: false,
      mention: false,
      poll: false,
    }),
  }),

  community: ImmutableMap({
    other: ImmutableMap({
      onlyMedia: false,
    }),
    regex: ImmutableMap({
      body: '',
    }),
  }),

  public: ImmutableMap({
    other: ImmutableMap({
      onlyMedia: false,
    }),
    regex: ImmutableMap({
      body: '',
    }),
  }),

  direct: ImmutableMap({
    regex: ImmutableMap({
      body: '',
    }),
  }),

  trends: ImmutableMap({
    show: true,
  }),
});

export function getSettings(state) {
  const soapboxSettings = state.getIn(['soapbox', 'defaultSettings']);
  return defaultSettings
    .mergeDeep(soapboxSettings)
    .mergeDeep(state.get('settings'));
}

export function changeSetting(path, value) {
  return dispatch => {
    dispatch({
      type: SETTING_CHANGE,
      path,
      value,
    });

    dispatch(saveSettings());
  };
};

const debouncedSave = debounce((dispatch, getState) => {
  const state = getState();
  if (!state.get('me')) return;
  if (getSettings(state).getIn(['saved'])) return;

  const data = state.get('settings').delete('saved').toJS();

  dispatch(patchMe({
    pleroma_settings_store: {
      [FE_NAME]: data,
    },
  })).then(response => {
    dispatch({ type: SETTING_SAVE });
  }).catch(error => {
    dispatch(showAlertForError(error));
  });
}, 5000, { trailing: true });

export function saveSettings() {
  return (dispatch, getState) => debouncedSave(dispatch, getState);
};
