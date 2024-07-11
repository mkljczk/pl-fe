import { isLoggedIn } from 'soapbox/utils/auth';
import { getFeatures } from 'soapbox/utils/features';
import { shouldHaveCard } from 'soapbox/utils/status';

import api from '../api';

import { setComposeToStatus } from './compose';
import { importFetchedStatus, importFetchedStatuses } from './importer';
import { openModal } from './modals';
import { getSettings } from './settings';
import { deleteFromTimelines } from './timelines';

import type { IntlShape } from 'react-intl';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status } from 'soapbox/types/entities';

const STATUS_CREATE_REQUEST = 'STATUS_CREATE_REQUEST';
const STATUS_CREATE_SUCCESS = 'STATUS_CREATE_SUCCESS';
const STATUS_CREATE_FAIL = 'STATUS_CREATE_FAIL';

const STATUS_FETCH_SOURCE_REQUEST = 'STATUS_FETCH_SOURCE_REQUEST';
const STATUS_FETCH_SOURCE_SUCCESS = 'STATUS_FETCH_SOURCE_SUCCESS';
const STATUS_FETCH_SOURCE_FAIL = 'STATUS_FETCH_SOURCE_FAIL';

const STATUS_FETCH_REQUEST = 'STATUS_FETCH_REQUEST';
const STATUS_FETCH_SUCCESS = 'STATUS_FETCH_SUCCESS';
const STATUS_FETCH_FAIL = 'STATUS_FETCH_FAIL';

const STATUS_DELETE_REQUEST = 'STATUS_DELETE_REQUEST';
const STATUS_DELETE_SUCCESS = 'STATUS_DELETE_SUCCESS';
const STATUS_DELETE_FAIL = 'STATUS_DELETE_FAIL';

const CONTEXT_FETCH_REQUEST = 'CONTEXT_FETCH_REQUEST';
const CONTEXT_FETCH_SUCCESS = 'CONTEXT_FETCH_SUCCESS';
const CONTEXT_FETCH_FAIL = 'CONTEXT_FETCH_FAIL';

const STATUS_MUTE_REQUEST = 'STATUS_MUTE_REQUEST';
const STATUS_MUTE_SUCCESS = 'STATUS_MUTE_SUCCESS';
const STATUS_MUTE_FAIL = 'STATUS_MUTE_FAIL';

const STATUS_UNMUTE_REQUEST = 'STATUS_UNMUTE_REQUEST';
const STATUS_UNMUTE_SUCCESS = 'STATUS_UNMUTE_SUCCESS';
const STATUS_UNMUTE_FAIL = 'STATUS_UNMUTE_FAIL';

const STATUS_REVEAL = 'STATUS_REVEAL';
const STATUS_HIDE = 'STATUS_HIDE';

const STATUS_TRANSLATE_REQUEST = 'STATUS_TRANSLATE_REQUEST';
const STATUS_TRANSLATE_SUCCESS = 'STATUS_TRANSLATE_SUCCESS';
const STATUS_TRANSLATE_FAIL = 'STATUS_TRANSLATE_FAIL';
const STATUS_TRANSLATE_UNDO = 'STATUS_TRANSLATE_UNDO';

const STATUS_UNFILTER = 'STATUS_UNFILTER';

const STATUS_LANGUAGE_CHANGE = 'STATUS_LANGUAGE_CHANGE';

const statusExists = (getState: () => RootState, statusId: string) =>
  (getState().statuses.get(statusId) || null) !== null;

const createStatus = (params: Record<string, any>, idempotencyKey: string, statusId: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: STATUS_CREATE_REQUEST, params, idempotencyKey, editing: !!statusId });

    return api(getState)(statusId === null ? '/api/v1/statuses' : `/api/v1/statuses/${statusId}`, {
      method: statusId === null ? 'POST' : 'PUT',
      body: JSON.stringify(params),
      headers: { 'Idempotency-Key': idempotencyKey },
    }).then(({ json: status }) => {
      // The backend might still be processing the rich media attachment
      if (!status.card && shouldHaveCard(status)) {
        status.expectsCard = true;
      }

      dispatch(importFetchedStatus(status, idempotencyKey));
      dispatch({ type: STATUS_CREATE_SUCCESS, status, params, idempotencyKey, editing: !!statusId });

      // Poll the backend for the updated card
      if (status.expectsCard) {
        const delay = 1000;

        const poll = (retries = 5) => {
          api(getState)(`/api/v1/statuses/${status.id}`).then(response => {
            if (response.json?.card) {
              dispatch(importFetchedStatus(response.json));
            } else if (retries > 0 && response.status === 200) {
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

const editStatus = (id: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  let status = getState().statuses.get(id)!;

  if (status.poll) {
    status = status.set('poll', getState().polls.get(status.poll) as any);
  }

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST });

  api(getState)(`/api/v1/statuses/${id}/source`).then(response => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS });
    dispatch(setComposeToStatus(status, response.json.text, response.json.spoiler_text, response.json.content_type, false));
    dispatch(openModal('COMPOSE'));
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, error });

  });
};

const fetchStatus = (id: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const skipLoading = statusExists(getState, id);

    dispatch({ type: STATUS_FETCH_REQUEST, id, skipLoading });

    const params = new URLSearchParams();
    if (intl && getSettings(getState()).get('autoTranslate')) {
      params.set('language', intl.locale);
    }

    return api(getState)(`/api/v1/statuses/${id}`, { params }).then(({ json: status }) => {
      dispatch(importFetchedStatus(status));
      dispatch({ type: STATUS_FETCH_SUCCESS, status, skipLoading });
      return status;
    }).catch(error => {
      dispatch({ type: STATUS_FETCH_FAIL, id, error, skipLoading, skipAlert: true });
    });
  };

const deleteStatus = (id: string, withRedraft = false) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return null;

    let status = getState().statuses.get(id)!;

    if (status.poll) {
      status = status.set('poll', getState().polls.get(status.poll) as any);
    }

    dispatch({ type: STATUS_DELETE_REQUEST, params: status });

    return api(getState)(`/api/v1/statuses/${id}`, { method: 'DELETE' })
      .then(response => {
        dispatch({ type: STATUS_DELETE_SUCCESS, id });
        dispatch(deleteFromTimelines(id));

        if (withRedraft) {
          dispatch(setComposeToStatus(status, response.json.text, response.json.spoiler_text, response.json.pleroma?.content_type, withRedraft));
          dispatch(openModal('COMPOSE'));
        }
      })
      .catch(error => {
        dispatch({ type: STATUS_DELETE_FAIL, params: status, error });
      });
  };

const updateStatus = (status: APIEntity) => (dispatch: AppDispatch) =>
  dispatch(importFetchedStatus(status));

const fetchContext = (id: string, intl?: IntlShape) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CONTEXT_FETCH_REQUEST, id });

    const params = new URLSearchParams();
    if (intl && getSettings(getState()).get('autoTranslate')) {
      params.set('language', intl.locale);
    }

    return api(getState)(`/api/v1/statuses/${id}/context`, { params }).then(({ json: context }) => {
      if (Array.isArray(context)) {
        // Mitra: returns a list of statuses
        dispatch(importFetchedStatuses(context));
      } else if (typeof context === 'object') {
        // Standard Mastodon API returns a map with `ancestors` and `descendants`
        const { ancestors, descendants } = context;
        const statuses = ancestors.concat(descendants);
        dispatch(importFetchedStatuses(statuses));
        dispatch({ type: CONTEXT_FETCH_SUCCESS, id, ancestors, descendants });
      } else {
        throw context;
      }
      return context;
    }).catch(error => {
      if (error.response?.status === 404) {
        dispatch(deleteFromTimelines(id));
      }

      dispatch({ type: CONTEXT_FETCH_FAIL, id, error, skipAlert: true });
    });
  };

const fetchStatusWithContext = (id: string, intl?: IntlShape) =>
  async (dispatch: AppDispatch) => Promise.all([
    dispatch(fetchContext(id, intl)),
    dispatch(fetchStatus(id, intl)),
  ]);

const muteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_MUTE_REQUEST, id });
    api(getState)(`/api/v1/statuses/${id}/mute`, { method: 'POST' }).then(() => {
      dispatch({ type: STATUS_MUTE_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: STATUS_MUTE_FAIL, id, error });
    });
  };

const unmuteStatus = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch({ type: STATUS_UNMUTE_REQUEST, id });
    api(getState)(`/api/v1/statuses/${id}/unmute`, { method: 'POST' }).then(() => {
      dispatch({ type: STATUS_UNMUTE_SUCCESS, id });
    }).catch(error => {
      dispatch({ type: STATUS_UNMUTE_FAIL, id, error });
    });
  };

const toggleMuteStatus = (status: Status) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (status.muted) {
      dispatch(unmuteStatus(status.id));
    } else {
      dispatch(muteStatus(status.id));
    }
  };

const hideStatus = (ids: string[] | string) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  return {
    type: STATUS_HIDE,
    ids,
  };
};

const revealStatus = (ids: string[] | string) => {
  if (!Array.isArray(ids)) {
    ids = [ids];
  }

  return {
    type: STATUS_REVEAL,
    ids,
  };
};

const toggleStatusHidden = (status: Status) => {
  if (status.hidden) {
    return revealStatus(status.id);
  } else {
    return hideStatus(status.id);
  }
};

let TRANSLATIONS_QUEUE: Set<string> = new Set();
let TRANSLATIONS_TIMEOUT: NodeJS.Timeout | null = null;

const translateStatus = (id: string, targetLanguage?: string, lazy?: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const features = getFeatures(getState().instance);

    dispatch({ type: STATUS_TRANSLATE_REQUEST, id });

    const handleTranslateMany = () => {
      const copy = [...TRANSLATIONS_QUEUE];
      TRANSLATIONS_QUEUE = new Set();
      if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);

      api(getState)('/api/v1/pl/statuses/translate', {
        method: 'POST',
        body: JSON.stringify({
          ids: copy,
          target_language: targetLanguage,
        }),
      }).then((response) => {
        response.json.forEach((translation: APIEntity) => {
          dispatch({
            type: STATUS_TRANSLATE_SUCCESS,
            id: translation.id,
            translation: translation,
          });

          copy
            .filter((statusId) => !response.json.some(({ id }: APIEntity) => id === statusId))
            .forEach((id) => dispatch({
              type: STATUS_TRANSLATE_FAIL,
              id,
            }));
        });
      }).catch(error => {
        dispatch({
          type: STATUS_TRANSLATE_FAIL,
          id,
          error,
        });
      });
    };

    if (features.lazyTranslations && lazy) {
      TRANSLATIONS_QUEUE.add(id);

      if (TRANSLATIONS_TIMEOUT) clearTimeout(TRANSLATIONS_TIMEOUT);
      TRANSLATIONS_TIMEOUT = setTimeout(() => handleTranslateMany(), 3000);
    } else if (features.lazyTranslations && TRANSLATIONS_QUEUE.size) {
      TRANSLATIONS_QUEUE.add(id);

      handleTranslateMany();
    } else {
      api(getState)(`/api/v1/statuses/${id}/translate`, {
        body: JSON.stringify({ target_language: targetLanguage }),
        method: 'POST',
      }).then(response => {
        dispatch({
          type: STATUS_TRANSLATE_SUCCESS,
          id,
          translation: response.json,
        });
      }).catch(error => {
        dispatch({
          type: STATUS_TRANSLATE_FAIL,
          id,
          error,
        });
      });
    }
  };

const undoStatusTranslation = (id: string) => ({
  type: STATUS_TRANSLATE_UNDO,
  id,
});

const unfilterStatus = (id: string) => ({
  type: STATUS_UNFILTER,
  id,
});

const changeStatusLanguage = (id: string, language: string) => ({
  type: STATUS_LANGUAGE_CHANGE,
  id,
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
