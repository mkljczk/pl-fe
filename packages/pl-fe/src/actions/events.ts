import { defineMessages, IntlShape } from 'react-intl';

import { getClient } from 'pl-fe/api';
import { useModalsStore } from 'pl-fe/stores';
import toast from 'pl-fe/toast';

import { importFetchedAccounts, importFetchedStatus, importFetchedStatuses } from './importer';
import { uploadFile } from './media';
import {
  STATUS_FETCH_SOURCE_FAIL,
  STATUS_FETCH_SOURCE_REQUEST,
  STATUS_FETCH_SOURCE_SUCCESS,
} from './statuses';

import type { Account, CreateEventParams, MediaAttachment, PaginatedResponse, Status } from 'pl-api';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';
import type { AppDispatch, RootState } from 'pl-fe/store';

const LOCATION_SEARCH_REQUEST = 'LOCATION_SEARCH_REQUEST' as const;
const LOCATION_SEARCH_SUCCESS = 'LOCATION_SEARCH_SUCCESS' as const;
const LOCATION_SEARCH_FAIL = 'LOCATION_SEARCH_FAIL' as const;

const EDIT_EVENT_NAME_CHANGE = 'EDIT_EVENT_NAME_CHANGE' as const;
const EDIT_EVENT_DESCRIPTION_CHANGE = 'EDIT_EVENT_DESCRIPTION_CHANGE' as const;
const EDIT_EVENT_START_TIME_CHANGE = 'EDIT_EVENT_START_TIME_CHANGE' as const;
const EDIT_EVENT_HAS_END_TIME_CHANGE = 'EDIT_EVENT_HAS_END_TIME_CHANGE' as const;
const EDIT_EVENT_END_TIME_CHANGE = 'EDIT_EVENT_END_TIME_CHANGE' as const;
const EDIT_EVENT_APPROVAL_REQUIRED_CHANGE = 'EDIT_EVENT_APPROVAL_REQUIRED_CHANGE' as const;
const EDIT_EVENT_LOCATION_CHANGE = 'EDIT_EVENT_LOCATION_CHANGE' as const;

const EVENT_BANNER_UPLOAD_REQUEST = 'EVENT_BANNER_UPLOAD_REQUEST' as const;
const EVENT_BANNER_UPLOAD_PROGRESS = 'EVENT_BANNER_UPLOAD_PROGRESS' as const;
const EVENT_BANNER_UPLOAD_SUCCESS = 'EVENT_BANNER_UPLOAD_SUCCESS' as const;
const EVENT_BANNER_UPLOAD_FAIL = 'EVENT_BANNER_UPLOAD_FAIL' as const;
const EVENT_BANNER_UPLOAD_UNDO = 'EVENT_BANNER_UPLOAD_UNDO' as const;

const EVENT_SUBMIT_REQUEST = 'EVENT_SUBMIT_REQUEST' as const;
const EVENT_SUBMIT_SUCCESS = 'EVENT_SUBMIT_SUCCESS' as const;
const EVENT_SUBMIT_FAIL = 'EVENT_SUBMIT_FAIL' as const;

const EVENT_JOIN_REQUEST = 'EVENT_JOIN_REQUEST' as const;
const EVENT_JOIN_SUCCESS = 'EVENT_JOIN_SUCCESS' as const;
const EVENT_JOIN_FAIL = 'EVENT_JOIN_FAIL' as const;

const EVENT_LEAVE_REQUEST = 'EVENT_LEAVE_REQUEST' as const;
const EVENT_LEAVE_SUCCESS = 'EVENT_LEAVE_SUCCESS' as const;
const EVENT_LEAVE_FAIL = 'EVENT_LEAVE_FAIL' as const;

const EVENT_PARTICIPATIONS_FETCH_REQUEST = 'EVENT_PARTICIPATIONS_FETCH_REQUEST' as const;
const EVENT_PARTICIPATIONS_FETCH_SUCCESS = 'EVENT_PARTICIPATIONS_FETCH_SUCCESS' as const;
const EVENT_PARTICIPATIONS_FETCH_FAIL = 'EVENT_PARTICIPATIONS_FETCH_FAIL' as const;

const EVENT_PARTICIPATIONS_EXPAND_REQUEST = 'EVENT_PARTICIPATIONS_EXPAND_REQUEST' as const;
const EVENT_PARTICIPATIONS_EXPAND_SUCCESS = 'EVENT_PARTICIPATIONS_EXPAND_SUCCESS' as const;
const EVENT_PARTICIPATIONS_EXPAND_FAIL = 'EVENT_PARTICIPATIONS_EXPAND_FAIL' as const;

const EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST = 'EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST' as const;
const EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS = 'EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL = 'EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL' as const;

const EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST' as const;
const EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL = 'EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL' as const;

const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST' as const;
const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL = 'EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL' as const;

const EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST = 'EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST' as const;
const EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS = 'EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS' as const;
const EVENT_PARTICIPATION_REQUEST_REJECT_FAIL = 'EVENT_PARTICIPATION_REQUEST_REJECT_FAIL' as const;

const EVENT_COMPOSE_CANCEL = 'EVENT_COMPOSE_CANCEL' as const;

const EVENT_FORM_SET = 'EVENT_FORM_SET' as const;

const RECENT_EVENTS_FETCH_REQUEST = 'RECENT_EVENTS_FETCH_REQUEST' as const;
const RECENT_EVENTS_FETCH_SUCCESS = 'RECENT_EVENTS_FETCH_SUCCESS' as const;
const RECENT_EVENTS_FETCH_FAIL = 'RECENT_EVENTS_FETCH_FAIL' as const;
const JOINED_EVENTS_FETCH_REQUEST = 'JOINED_EVENTS_FETCH_REQUEST' as const;
const JOINED_EVENTS_FETCH_SUCCESS = 'JOINED_EVENTS_FETCH_SUCCESS' as const;
const JOINED_EVENTS_FETCH_FAIL = 'JOINED_EVENTS_FETCH_FAIL' as const;

const noOp = () => new Promise(f => f(undefined));

const messages = defineMessages({
  exceededImageSizeLimit: { id: 'upload_error.image_size_limit', defaultMessage: 'Image exceeds the current file size limit ({limit})' },
  success: { id: 'compose_event.submit_success', defaultMessage: 'Your event was created' },
  editSuccess: { id: 'compose_event.edit_success', defaultMessage: 'Your event was edited' },
  joinSuccess: { id: 'join_event.success', defaultMessage: 'Joined the event' },
  joinRequestSuccess: { id: 'join_event.request_success', defaultMessage: 'Requested to join the event' },
  view: { id: 'toast.view', defaultMessage: 'View' },
  authorized: { id: 'compose_event.participation_requests.authorize_success', defaultMessage: 'User accepted' },
  rejected: { id: 'compose_event.participation_requests.reject_success', defaultMessage: 'User rejected' },
});

const locationSearch = (query: string, signal?: AbortSignal) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: LOCATION_SEARCH_REQUEST, query });
    return getClient(getState).search.searchLocation(query, { signal }).then((locations) => {
      dispatch({ type: LOCATION_SEARCH_SUCCESS, locations });
      return locations;
    }).catch(error => {
      dispatch({ type: LOCATION_SEARCH_FAIL });
      throw error;
    });
  };

const changeEditEventName = (value: string) => ({
  type: EDIT_EVENT_NAME_CHANGE,
  value,
});

const changeEditEventDescription = (value: string) => ({
  type: EDIT_EVENT_DESCRIPTION_CHANGE,
  value,
});

const changeEditEventStartTime = (value: Date) => ({
  type: EDIT_EVENT_START_TIME_CHANGE,
  value,
});

const changeEditEventEndTime = (value: Date) => ({
  type: EDIT_EVENT_END_TIME_CHANGE,
  value,
});

const changeEditEventHasEndTime = (value: boolean) => ({
  type: EDIT_EVENT_HAS_END_TIME_CHANGE,
  value,
});

const changeEditEventApprovalRequired = (value: boolean) => ({
  type: EDIT_EVENT_APPROVAL_REQUIRED_CHANGE,
  value,
});

const changeEditEventLocation = (value: string | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    let location = null;

    if (value) {
      location = getState().locations.get(value);
    }

    dispatch({
      type: EDIT_EVENT_LOCATION_CHANGE,
      value: location,
    });
  };

const uploadEventBanner = (file: File, intl: IntlShape) =>
  (dispatch: AppDispatch) => {
    let progress = 0;

    dispatch(uploadEventBannerRequest());

    dispatch(uploadFile(
      file,
      intl,
      (data) => dispatch(uploadEventBannerSuccess(data, file)),
      (error) => dispatch(uploadEventBannerFail(error)),
      ({ loaded }: any) => {
        progress = loaded;
        dispatch(uploadEventBannerProgress(progress));
      },
    ));
  };

const uploadEventBannerRequest = () => ({
  type: EVENT_BANNER_UPLOAD_REQUEST,
});

const uploadEventBannerProgress = (loaded: number) => ({
  type: EVENT_BANNER_UPLOAD_PROGRESS,
  loaded,
});

const uploadEventBannerSuccess = (media: MediaAttachment, file: File) => ({
  type: EVENT_BANNER_UPLOAD_SUCCESS,
  media,
  file,
});

const uploadEventBannerFail = (error: unknown) => ({
  type: EVENT_BANNER_UPLOAD_FAIL,
  error,
});

const undoUploadEventBanner = () => ({
  type: EVENT_BANNER_UPLOAD_UNDO,
});

const submitEvent = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    const statusId = state.compose_event.id;
    const name = state.compose_event.name;
    const status = state.compose_event.status;
    const banner = state.compose_event.banner;
    const startTime = state.compose_event.start_time;
    const endTime = state.compose_event.end_time;
    const joinMode = state.compose_event.approval_required ? 'restricted' : 'free';
    const location = state.compose_event.location;

    if (!name || !name.length) {
      return;
    }

    dispatch(submitEventRequest());

    const params: CreateEventParams = {
      name,
      status,
      start_time: startTime.toISOString(),
      join_mode: joinMode,
      content_type: 'text/markdown',
    };

    if (endTime) params.end_time = endTime?.toISOString();
    if (banner) params.banner_id = banner.id;
    if (location) params.location_id = location.origin_id;

    return (
      statusId === null
        ? getClient(state).events.createEvent(params)
        : getClient(state).events.editEvent(statusId, params)
    ).then((data) => {
      useModalsStore.getState().closeModal('COMPOSE_EVENT');
      dispatch(importFetchedStatus(data));
      dispatch(submitEventSuccess(data));
      toast.success(
        statusId ? messages.editSuccess : messages.success,
        {
          actionLabel: messages.view,
          actionLink: `/@${data.account.acct}/events/${data.id}`,
        },
      );
    }).catch((error) => {
      dispatch(submitEventFail(error));
    });
  };

const submitEventRequest = () => ({
  type: EVENT_SUBMIT_REQUEST,
});

const submitEventSuccess = (status: Status) => ({
  type: EVENT_SUBMIT_SUCCESS,
  status,
});

const submitEventFail = (error: unknown) => ({
  type: EVENT_SUBMIT_FAIL,
  error,
});

const joinEvent = (statusId: string, participationMessage?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses.get(statusId);

    if (!status || !status.event || status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(joinEventRequest(status.id));

    return getClient(getState).events.joinEvent(statusId, participationMessage).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(joinEventSuccess(status.id));
      toast.success(
        data.event?.join_state === 'pending' ? messages.joinRequestSuccess : messages.joinSuccess,
        {
          actionLabel: messages.view,
          actionLink: `/@${data.account.acct}/events/${data.id}`,
        },
      );
    }).catch((error) => {
      dispatch(joinEventFail(error, status.id, status?.event?.join_state || null));
    });
  };

const joinEventRequest = (statusId: string) => ({
  type: EVENT_JOIN_REQUEST,
  statusId,
});

const joinEventSuccess = (statusId: string) => ({
  type: EVENT_JOIN_SUCCESS,
  statusId,
});

const joinEventFail = (error: unknown, statusId: string, previousState: string | null) => ({
  type: EVENT_JOIN_FAIL,
  error,
  statusId,
  previousState,
});

const leaveEvent = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const status = getState().statuses.get(statusId);

    if (!status || !status.event || !status.event.join_state) {
      return dispatch(noOp);
    }

    dispatch(leaveEventRequest(status.id));

    return getClient(getState).events.leaveEvent(statusId).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(leaveEventSuccess(status.id));
    }).catch((error) => {
      dispatch(leaveEventFail(error, status.id));
    });
  };

const leaveEventRequest = (statusId: string) => ({
  type: EVENT_LEAVE_REQUEST,
  statusId,
});

const leaveEventSuccess = (statusId: string) => ({
  type: EVENT_LEAVE_SUCCESS,
  statusId,
});

const leaveEventFail = (error: unknown, statusId: string) => ({
  type: EVENT_LEAVE_FAIL,
  statusId,
  error,
});

const fetchEventParticipations = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchEventParticipationsRequest(statusId));

    return getClient(getState).events.getEventParticipations(statusId).then(response => {
      dispatch(importFetchedAccounts(response.items));
      return dispatch(fetchEventParticipationsSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(fetchEventParticipationsFail(statusId, error));
    });
  };

const fetchEventParticipationsRequest = (statusId: string) => ({
  type: EVENT_PARTICIPATIONS_FETCH_REQUEST,
  statusId,
});

const fetchEventParticipationsSuccess = (statusId: string, accounts: Array<Account>, next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  statusId,
  accounts,
  next,
});

const fetchEventParticipationsFail = (statusId: string, error: unknown) => ({
  type: EVENT_PARTICIPATIONS_FETCH_FAIL,
  statusId,
  error,
});

const expandEventParticipations = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().user_lists.event_participations.get(statusId)?.next || null;

    if (next === null) {
      return dispatch(noOp);
    }

    dispatch(expandEventParticipationsRequest(statusId));

    return next().then(response => {
      dispatch(importFetchedAccounts(response.items));
      return dispatch(expandEventParticipationsSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(expandEventParticipationsFail(statusId, error));
    });
  };

const expandEventParticipationsRequest = (statusId: string) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_REQUEST,
  statusId,
});

const expandEventParticipationsSuccess = (statusId: string, accounts: Array<Account>, next: (() => Promise<PaginatedResponse<Account>>) | null) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  statusId,
  accounts,
  next,
});

const expandEventParticipationsFail = (statusId: string, error: unknown) => ({
  type: EVENT_PARTICIPATIONS_EXPAND_FAIL,
  statusId,
  error,
});

const fetchEventParticipationRequests = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchEventParticipationRequestsRequest(statusId));

    return getClient(getState).events.getEventParticipationRequests(statusId).then(response => {
      dispatch(importFetchedAccounts(response.items.map(({ account }) => account)));
      return dispatch(fetchEventParticipationRequestsSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(fetchEventParticipationRequestsFail(statusId, error));
    });
  };

const fetchEventParticipationRequestsRequest = (statusId: string) => ({
  type: EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST,
  statusId,
});

const fetchEventParticipationRequestsSuccess = (statusId: string, participations: Array<{
  account: Account;
  participation_message: string;
}>, next: (() => Promise<PaginatedResponse<{ account: Account }>>) | null) => ({
  type: EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  statusId,
  participations,
  next,
});

const fetchEventParticipationRequestsFail = (statusId: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL,
  statusId,
  error,
});

const expandEventParticipationRequests = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const next = getState().user_lists.event_participation_requests.get(statusId)?.next || null;

    if (next === null) {
      return dispatch(noOp);
    }

    dispatch(expandEventParticipationRequestsRequest(statusId));

    return next().then(response => {
      dispatch(importFetchedAccounts(response.items.map(({ account }) => account)));
      return dispatch(expandEventParticipationRequestsSuccess(statusId, response.items, response.next));
    }).catch(error => {
      dispatch(expandEventParticipationRequestsFail(statusId, error));
    });
  };

const expandEventParticipationRequestsRequest = (statusId: string) => ({
  type: EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST,
  statusId,
});

const expandEventParticipationRequestsSuccess = (statusId: string, participations: Array<{
  account: Account;
  participation_message: string;
}>, next: (() => Promise<PaginatedResponse<{ account: Account }>>) | null) => ({
  type: EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  statusId,
  participations,
  next,
});

const expandEventParticipationRequestsFail = (statusId: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL,
  statusId,
  error,
});

const authorizeEventParticipationRequest = (statusId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(authorizeEventParticipationRequestRequest(statusId, accountId));

    return getClient(getState).events.acceptEventParticipationRequest(statusId, accountId).then(() => {
      dispatch(authorizeEventParticipationRequestSuccess(statusId, accountId));
      toast.success(messages.authorized);
    }).catch(error => dispatch(authorizeEventParticipationRequestFail(statusId, accountId, error)));
  };

const authorizeEventParticipationRequestRequest = (statusId: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST,
  statusId,
  accountId,
});

const authorizeEventParticipationRequestSuccess = (statusId: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  statusId,
  accountId,
});

const authorizeEventParticipationRequestFail = (statusId: string, accountId: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL,
  statusId,
  accountId,
  error,
});

const rejectEventParticipationRequest = (statusId: string, accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(rejectEventParticipationRequestRequest(statusId, accountId));

    return getClient(getState).events.rejectEventParticipationRequest(statusId, accountId).then(() => {
      dispatch(rejectEventParticipationRequestSuccess(statusId, accountId));
      toast.success(messages.rejected);
    }).catch(error => dispatch(rejectEventParticipationRequestFail(statusId, accountId, error)));
  };

const rejectEventParticipationRequestRequest = (statusId: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST,
  statusId,
  accountId,
});

const rejectEventParticipationRequestSuccess = (statusId: string, accountId: string) => ({
  type: EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
  statusId,
  accountId,
});

const rejectEventParticipationRequestFail = (statusId: string, accountId: string, error: unknown) => ({
  type: EVENT_PARTICIPATION_REQUEST_REJECT_FAIL,
  statusId,
  accountId,
  error,
});

const fetchEventIcs = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).events.getEventIcs(statusId);

const cancelEventCompose = () => ({
  type: EVENT_COMPOSE_CANCEL,
});

interface EventFormSetAction {
  type: typeof EVENT_FORM_SET;
  status: MinifiedStatus;
  text: string;
  location: Record<string, any>;
}

const editEvent = (statusId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  const status = getState().statuses.get(statusId)!;

  dispatch({ type: STATUS_FETCH_SOURCE_REQUEST, statusId });

  return getClient(getState()).statuses.getStatusSource(statusId).then(response => {
    dispatch({ type: STATUS_FETCH_SOURCE_SUCCESS, statusId });
    dispatch({
      type: EVENT_FORM_SET,
      status,
      text: response.text,
      location: response.location,
    });
    useModalsStore.getState().openModal('COMPOSE_EVENT');
  }).catch(error => {
    dispatch({ type: STATUS_FETCH_SOURCE_FAIL, statusId, error });
  });
};

const fetchRecentEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.get('recent_events')?.isLoading) {
      return;
    }

    dispatch({ type: RECENT_EVENTS_FETCH_REQUEST });

    return getClient(getState()).timelines.publicTimeline({
      only_events: true,
    }).then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch({
        type: RECENT_EVENTS_FETCH_SUCCESS,
        statuses: response.items,
        next: response.next,
      });
    }).catch(error => {
      dispatch({ type: RECENT_EVENTS_FETCH_FAIL, error });
    });
  };

const fetchJoinedEvents = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().status_lists.get('joined_events')?.isLoading) {
      return;
    }

    dispatch({ type: JOINED_EVENTS_FETCH_REQUEST });

    getClient(getState).events.getJoinedEvents().then(response => {
      dispatch(importFetchedStatuses(response.items));
      dispatch({
        type: JOINED_EVENTS_FETCH_SUCCESS,
        statuses: response.items,
        next: response.next,
      });
    }).catch(error => {
      dispatch({ type: JOINED_EVENTS_FETCH_FAIL, error });
    });
  };

type EventsAction =
  | ReturnType<typeof cancelEventCompose>
  | EventFormSetAction;

export {
  LOCATION_SEARCH_REQUEST,
  LOCATION_SEARCH_SUCCESS,
  LOCATION_SEARCH_FAIL,
  EDIT_EVENT_NAME_CHANGE,
  EDIT_EVENT_DESCRIPTION_CHANGE,
  EDIT_EVENT_START_TIME_CHANGE,
  EDIT_EVENT_END_TIME_CHANGE,
  EDIT_EVENT_HAS_END_TIME_CHANGE,
  EDIT_EVENT_APPROVAL_REQUIRED_CHANGE,
  EDIT_EVENT_LOCATION_CHANGE,
  EVENT_BANNER_UPLOAD_REQUEST,
  EVENT_BANNER_UPLOAD_PROGRESS,
  EVENT_BANNER_UPLOAD_SUCCESS,
  EVENT_BANNER_UPLOAD_FAIL,
  EVENT_BANNER_UPLOAD_UNDO,
  EVENT_SUBMIT_REQUEST,
  EVENT_SUBMIT_SUCCESS,
  EVENT_SUBMIT_FAIL,
  EVENT_JOIN_REQUEST,
  EVENT_JOIN_SUCCESS,
  EVENT_JOIN_FAIL,
  EVENT_LEAVE_REQUEST,
  EVENT_LEAVE_SUCCESS,
  EVENT_LEAVE_FAIL,
  EVENT_PARTICIPATIONS_FETCH_REQUEST,
  EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  EVENT_PARTICIPATIONS_FETCH_FAIL,
  EVENT_PARTICIPATIONS_EXPAND_REQUEST,
  EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  EVENT_PARTICIPATIONS_EXPAND_FAIL,
  EVENT_PARTICIPATION_REQUESTS_FETCH_REQUEST,
  EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_FETCH_FAIL,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_REQUEST,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_FAIL,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_REQUEST,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_FAIL,
  EVENT_PARTICIPATION_REQUEST_REJECT_REQUEST,
  EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_REJECT_FAIL,
  EVENT_COMPOSE_CANCEL,
  EVENT_FORM_SET,
  RECENT_EVENTS_FETCH_REQUEST,
  RECENT_EVENTS_FETCH_SUCCESS,
  RECENT_EVENTS_FETCH_FAIL,
  JOINED_EVENTS_FETCH_REQUEST,
  JOINED_EVENTS_FETCH_SUCCESS,
  JOINED_EVENTS_FETCH_FAIL,
  locationSearch,
  changeEditEventName,
  changeEditEventDescription,
  changeEditEventStartTime,
  changeEditEventEndTime,
  changeEditEventHasEndTime,
  changeEditEventApprovalRequired,
  changeEditEventLocation,
  uploadEventBanner,
  uploadEventBannerRequest,
  uploadEventBannerProgress,
  uploadEventBannerSuccess,
  uploadEventBannerFail,
  undoUploadEventBanner,
  submitEvent,
  submitEventRequest,
  submitEventSuccess,
  submitEventFail,
  joinEvent,
  joinEventRequest,
  joinEventSuccess,
  joinEventFail,
  leaveEvent,
  leaveEventRequest,
  leaveEventSuccess,
  leaveEventFail,
  fetchEventParticipations,
  fetchEventParticipationsRequest,
  fetchEventParticipationsSuccess,
  fetchEventParticipationsFail,
  expandEventParticipations,
  expandEventParticipationsRequest,
  expandEventParticipationsSuccess,
  expandEventParticipationsFail,
  fetchEventParticipationRequests,
  fetchEventParticipationRequestsRequest,
  fetchEventParticipationRequestsSuccess,
  fetchEventParticipationRequestsFail,
  expandEventParticipationRequests,
  expandEventParticipationRequestsRequest,
  expandEventParticipationRequestsSuccess,
  expandEventParticipationRequestsFail,
  authorizeEventParticipationRequest,
  authorizeEventParticipationRequestRequest,
  authorizeEventParticipationRequestSuccess,
  authorizeEventParticipationRequestFail,
  rejectEventParticipationRequest,
  rejectEventParticipationRequestRequest,
  rejectEventParticipationRequestSuccess,
  rejectEventParticipationRequestFail,
  fetchEventIcs,
  cancelEventCompose,
  editEvent,
  fetchRecentEvents,
  fetchJoinedEvents,
  type EventsAction,
};
