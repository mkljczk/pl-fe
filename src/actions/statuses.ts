import { isLoggedIn } from 'soapbox/utils/auth';
import { shouldHaveCard } from 'soapbox/utils/status';

import { getClient } from '../api';

import { setComposeToStatus } from './compose';
import { importFetchedStatus, importFetchedStatuses } from './importer';
import { openModal } from './modals';
import { getSettings } from './settings';
import { deleteFromTimelines } from './timelines';

import type { CreateStatusParams, Status as BaseStatus } from 'pl-api';
import type { IntlShape } from 'react-intl';
import type { Status } from 'soapbox/normalizers';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

const STATUS_CREATE_REQUEST = 'STATUS_CREATE_REQUEST' as const;
const STATUS_CREATE_SUCCESS = 'STATUS_CREATE_SUCCESS' as const;
const STATUS_CREATE_FAIL = 'STATUS_CREATE_FAIL' as const;

const STATUS_FETCH_SOURCE_REQUEST = 'STATUS_FETCH_SOURCE_REQUEST' as const;
const STATUS_FETCH_SOURCE_SUCCESS = 'STATUS_FETCH_SOURCE_SUCCESS' as const;
const STATUS_FETCH_SOURCE_FAIL = 'STATUS_FETCH_SOURCE_FAIL' as const;

const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST' as const;
const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS' as const;
const STATUS_FETCH_FAIL = 'STATUS_FETCH_FAIL' as const;

const STATUS_DELETE_REQUEST = 'STATUS_DELETE_REQUEST' as const;
const STATUS_DELETE_SUCCESS = 'STATUS_DELETE_SUCCESS' as const;
const STATUS_DELETE_FAIL = 'STATUS_DELETE_FAIL' as const;

const CONTEXT_FETCH_REQUEST = 'CONTEXT_FETCH_REQUEST' as const;
const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS' as const;
const CONTEXT_FETCH_FAIL = 'CONTEXT_FETCH_FAIL' as const;

const STATUS_MUTE_REQUEST = 'STATUS_MUTE_REQUEST' as const;
const STATUS_MUTE_SUCCESS = 'STATUS_MUTE_SUCCESS' as const;
const STATUS_MUTE_FAIL = 'STATUS_MUTE_FAIL' as const;

const STATUS_UNMUTE_REQUEST = 'STATUS_UNMUTE_REQUEST' as const;
const STATUS_UNMUTE_SUCCESS = 'STATUS_UNMUTE_SUCCESS' as const;
const STATUS_UNMUTE_FAIL = 'STATUS_UNMUTE_FAIL' as const;

const STATUS_REVEAL = 'STATUS_REVEAL' as const;
const STATUS_HIDE = 'STATUS_HIDE' as const;

const STATUS_TRANSLATE_REQUEST = 'STATUS_TRANSLATE_REQUEST' as const;
const STATUS_TRANSLATE_SUCCESS = 'STATUS_TRANSLATE_SUCCESS' as const;
const STATUS_TRANSLATE_FAIL = 'STATUS_TRANSLATE_FAIL' as const;
const STATUS_TRANSLATE_UNDO = 'STATUS_TRANSLATE_UNDO' as const;

const STATUS_UNFILTER = 'STATUS_UNFILTER' as const;

const STATUS_LANGUAGE_CHANGE = 'STATUS_LANGUAGE_CHANGE' as const;

const createStatus = (params: CreateStatusParams, idempotencyKey: string, statusId: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: STATUS_CREATE_REQUEST, params, idempotencyKey, editing: !!statusId });

    return (statusId === null ? getClient(getState()).statuses.createStatus(params) : getClient(getState()).statuses.editStatus(statusId, params))
      .then((status) => {
        // The backend might still be processing the rich media attachment
        const expectsCard = status.scheduled_at === null && !status.card && shouldHaveCard(status);

        dispatch(importFetchedStatus({ ...status, expectsCard } as BaseStatus, idempotencyKey));
        dispatch({ type: STATUS_CREATE_SUCCESS, status, params, idempotencyKey, editing: !!statusId });

        // Poll the backend for the updated card
        if (expectsCard) {
          const delay = 1000;

          const poll = (retries = 5) => {
            return getClient(getState()).statuses.getStatus(status.id).then(response => {
              if (response.card) {
                dispatch(importFetchedStatus(response));
              } else if (retries > 0 && response) {
                setTimeout(() => poll(retries - 1), delay);
              }
            }).catch(console.error);
          };

          setTimeout(() => poll(), delay);
        }

        return status;
      }).catch(error => {
        dispatch({ type: STATUS_CREATE_FAIL, error, params, idempotencyKey, editing: !!statusId });
        throw error;
      });
  };

const editStatus = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();

  const status = state.statuses.get(statusId)!;
  const poll = status.poll ? state.polls.get(status.poll) : undefined;

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST });

  return getClient(state).statuses.getStatusSource(statusId).then(response => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch(setComposeToStatus(status, poll, response.text, response.spoiler_text, response.content_type, false));
    dispatch(openModal('COMPOSE'));
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, error });

  });
};

const fetchStatus = (statusId: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: STATUS_FETCH_REQUEST, statusId });

    const params = intl && getSettings(getState()).get('autoTranslate') ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getStatus(statusId, params).then(status => {
      dispatch(importFetchedStatus(status));
      dispatch({ type: STATUS_FETCH_SUCCESS, status });
      return status;
    }).catch(error => {
      dispatch({ type: STATUS_FETCH_FAIL, statusId, error, skipAlert: true });
    });
  };

const deleteStatus = (statusId: string, withRedraft = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    const state = getState();

    const status = state.statuses.get(statusId)!;
    const poll = status.poll ? state.polls.get(status.poll) : undefined;

    dispatch({ type: STATUS_DELETE_REQUEST, params: status });

    return getClient(state).statuses.deleteStatus(statusId).then(response => {
      dispatch({ type: STATUS_DELETE_SUCCESS, statusId });
      dispatch(deleteFromTimelines(statusId));

      if (withRedraft) {
        dispatch(setComposeToStatus(status, poll, response.text || '', response.spoiler_text, response.content_type, withRedraft));
        dispatch(openModal('COMPOSE'));
      }
    })
      .catch(error => {
        dispatch({ type: STATUS_DELETE_FAIL, params: status, error });
      });
  };

const updateStatus = (status: BaseStatus) => (dispatch: AppDispatch) =>
  dispatch(importFetchedStatus(status));

const fetchContext = (statusId: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CONTEXT_FETCH_REQUEST, statusId });

    const params = intl && getSettings(getState()).get('autoTranslate') ? {
      language: intl.locale,
    } : undefined;

    return getClient(getState()).statuses.getContext(statusId, params).then(context => {
      if (Array.isArray(context)) {
        // Mitra: returns a list of statuses
        dispatch(importFetchedStatuses(context));
      } else if (typeof context === 'object') {
        // Standard Mastodon API returns a map with `ancestors` and `descendants`
        const { ancestors, descendants } = context;
        const statuses = ancestors.concat(descendants);
        dispatch(importFetchedStatuses(statuses));
        dispatch({ type: CONTEXT_FETCH_SUCCESS, statusId, ancestors, descendants });
      } else {
        throw context;
      }
      return context;
    }).catch(error => {
      if (error.response?.status === 404) {
        dispatch(deleteFromTimelines(statusId));
      }

      dispatch({ type: CONTEXT_FETCH_FAIL, statusId, error, skipAlert: true });
    });
  };

const fetchStatusWithContext = (statusId: string, intl?: IntlShape) =>
  async (dispatch: AppDispatch) => Promise.all([
    dispatch(fetchContext(statusId, intl)),
    dispatch(fetchStatus(statusId, intl)),
  ]);

const muteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_MUTE_REQUEST, statusId });
    return getClient(getState()).statuses.muteStatus(statusId).then((status) => {
      dispatch({ type: STATUS_MUTE_SUCCESS, statusId });
    }).catch(error => {
      dispatch({ type: STATUS_MUTE_FAIL, statusId, error });
    });
  };

const unmuteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_UNMUTE_REQUEST, statusId });
    return getClient(getState()).statuses.unmuteStatus(statusId).then(() => {
      dispatch({ type: STATUS_UNMUTE_SUCCESS, statusId });
    }).catch(error => {
      dispatch({ type: STATUS_UNMUTE_FAIL, statusId, error });
    });
  };

const toggleMuteStatus = (status: Pick<Status, 'id' | 'muted'>) =>
  (dispatch: AppDispatch) => {
    if (status.muted) {
      dispatch(unmuteStatus(status.id));
    } else {
      dispatch(muteStatus(status.id));
    }
  };

const hideStatus = (statusIds: string[] | string) => {
  if (!Array.isArray(statusIds)) {
    statusIds = [statusIds];
  }

  return {
    type: STATUS_HIDE,
    statusIds,
  };
};

const revealStatus = (statusIds: string[] | string) => {
  if (!Array.isArray(statusIds)) {
    statusIds = [statusIds];
  }

  return {
    type: STATUS_REVEAL,
    statusIds,
  };
};

const toggleStatusHidden = (status: Pick<Status, 'id' | 'hidden'>) => {
  if (status.hidden) {
    return revealStatus(status.id);
  } else {
    return hideStatus(status.id);
  }
};

let TRANSLATIONS_QUEUE: Set<string> = new Set();
let TRANSLATIONS_TIMEOUT: NodeJS.Timeout | null = null;

const translateStatus = (statusId: string, targetLanguage?: string, lazy?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const client = getClient(getState);
    const features = client.features;

    dispatch({ type: STATUS_TRANSLATE_REQUEST, statusId });

    const handleTranslateMany = () => {
      const copy = [...TRANSLATIONS_QUEUE];
      TRANSLATIONS_QUEUE = new Set();
      if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);

      return client.request('/api/v1/pl/statuses/translate', {
        method: 'POST', body: { ids: copy, lang: targetLanguage },
      }).then((response) => {
        response.json.forEach((translation: APIEntity) => {
          dispatch({
            type: STATUS_TRANSLATE_SUCCESS,
            statusId: translation.id,
            translation: translation,
          });

          copy
            .filter((statusId) => !response.json.some(({ id }: APIEntity) => id === statusId))
            .forEach((statusId) => dispatch({
              type: STATUS_TRANSLATE_FAIL,
              statusId,
            }));
        });
      }).catch(error => {
        dispatch({
          type: STATUS_TRANSLATE_FAIL,
          statusId,
          error,
        });
      });
    };

    if (features.lazyTranslations && lazy) {
      TRANSLATIONS_QUEUE.add(statusId);

      if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);
      TRANSLATIONS_TIMEOUT = setTimeout(() => handleTranslateMany(), 3000);
    } else if (features.lazyTranslations && TRANSLATIONS_QUEUE.size) {
      TRANSLATIONS_QUEUE.add(statusId);

      handleTranslateMany();
    } else {
      return client.statuses.translateStatus(statusId, targetLanguage).then(response => {
        dispatch({
          type: STATUS_TRANSLATE_SUCCESS,
          statusId,
          translation: response,
        });
      }).catch(error => {
        dispatch({
          type: STATUS_TRANSLATE_FAIL,
          statusId,
          error,
        });
      });
    }
  };

const undoStatusTranslation = (statusId: string) => ({
  type: STATUS_TRANSLATE_UNDO,
  statusId,
});

const unfilterStatus = (statusId: string) => ({
  type: STATUS_UNFILTER,
  statusId,
});

const changeStatusLanguage = (statusId: string, language: string) => ({
  type: STATUS_LANGUAGE_CHANGE,
  statusId,
  language,
});

export {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
  STATUS_CREATE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_REQUEST,
  STATUS_FETCH_SUCCESS,
  STATUS_FETCH_FAIL,
  STATUS_DELETE_REQUEST,
  STATUS_DELETE_SUCCESS,
  STATUS_DELETE_FAIL,
  CONTEXT_FETCH_REQUEST,
  CONTEXT_FETCH_SUCCESS,
  CONTEXT_FETCH_FAIL,
  STATUS_MUTE_REQUEST,
  STATUS_MUTE_SUCCESS,
  STATUS_MUTE_FAIL,
  STATUS_UNMUTE_REQUEST,
  STATUS_UNMUTE_SUCCESS,
  STATUS_UNMUTE_FAIL,
  STATUS_REVEAL,
  STATUS_HIDE,
  STATUS_TRANSLATE_REQUEST,
  STATUS_TRANSLATE_SUCCESS,
  STATUS_TRANSLATE_FAIL,
  STATUS_TRANSLATE_UNDO,
  STATUS_UNFILTER,
  STATUS_LANGUAGE_CHANGE,
  createStatus,
  editStatus,
  fetchStatus,
  deleteStatus,
  updateStatus,
  fetchContext,
  fetchStatusWithContext,
  muteStatus,
  unmuteStatus,
  toggleMuteStatus,
  hideStatus,
  revealStatus,
  toggleStatusHidden,
  translateStatus,
  undoStatusTranslation,
  unfilterStatus,
  changeStatusLanguage,
};
