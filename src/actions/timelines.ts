import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet } from 'immutable';

import { getSettings } from 'soapbox/actions/settings';
import { normalizeStatus } from 'soapbox/normalizers';
import { shouldFilter } from 'soapbox/utils/timelines';

import api, { getNextLink, getPrevLink } from '../api';

import { importFetchedStatus, importFetchedStatuses } from './importer';

import type { IntlShape } from 'react-intl';
import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity, Status } from 'soapbox/types/entities';

const TIMELINE_UPDATE = 'TIMELINE_UPDATE' as const;
const TIMELINE_DELETE = 'TIMELINE_DELETE' as const;
const TIMELINE_CLEAR = 'TIMELINE_CLEAR' as const;
const TIMELINE_UPDATE_QUEUE = 'TIMELINE_UPDATE_QUEUE' as const;
const TIMELINE_DEQUEUE = 'TIMELINE_DEQUEUE' as const;
const TIMELINE_SCROLL_TOP = 'TIMELINE_SCROLL_TOP' as const;

const TIMELINE_EXPAND_REQUEST = 'TIMELINE_EXPAND_REQUEST' as const;
const TIMELINE_EXPAND_SUCCESS = 'TIMELINE_EXPAND_SUCCESS' as const;
const TIMELINE_EXPAND_FAIL = 'TIMELINE_EXPAND_FAIL' as const;

const TIMELINE_CONNECT = 'TIMELINE_CONNECT' as const;
const TIMELINE_DISCONNECT = 'TIMELINE_DISCONNECT' as const;

const TIMELINE_INSERT = 'TIMELINE_INSERT' as const;

const MAX_QUEUED_ITEMS = 40;

const processTimelineUpdate = (timeline: string, status: APIEntity, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const me = getState().me;
    const ownStatus = status.account?.id === me;
    const hasPendingStatuses = !getState().pending_statuses.isEmpty();

    const columnSettings = getSettings(getState()).get(timeline, ImmutableMap());
    const shouldSkipQueue = shouldFilter(normalizeStatus(status) as Status, columnSettings as any);

    if (ownStatus && hasPendingStatuses) {
      // WebSockets push statuses without the Idempotency-Key,
      // so if we have pending statuses, don't import it from here.
      // We implement optimistic non-blocking statuses.
      return;
    }

    dispatch(importFetchedStatus(status));

    if (shouldSkipQueue) {
      dispatch(updateTimeline(timeline, status.id, accept));
    } else {
      dispatch(updateTimelineQueue(timeline, status.id, accept));
    }
  };

const updateTimeline = (timeline: string, statusId: string, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch) => {
    // if (typeof accept === 'function' && !accept(status)) {
    //   return;
    // }

    dispatch({
      type: TIMELINE_UPDATE,
      timeline,
      statusId,
    });
  };

const updateTimelineQueue = (timeline: string, statusId: string, accept: ((status: APIEntity) => boolean) | null) =>
  (dispatch: AppDispatch) => {
    // if (typeof accept === 'function' && !accept(status)) {
    //   return;
    // }

    dispatch({
      type: TIMELINE_UPDATE_QUEUE,
      timeline,
      statusId,
    });
  };

const dequeueTimeline = (timelineId: string, expandFunc?: (lastStatusId: string) => void, optionalExpandArgs?: any) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const queuedCount = state.timelines.get(timelineId)?.totalQueuedItemsCount || 0;

    if (queuedCount <= 0) return;

    if (queuedCount <= MAX_QUEUED_ITEMS) {
      dispatch({ type: TIMELINE_DEQUEUE, timeline: timelineId });
      return;
    }

    if (typeof expandFunc === 'function') {
      dispatch(clearTimeline(timelineId));
      // @ts-ignore
      expandFunc();
    } else {
      if (timelineId === 'home') {
        dispatch(clearTimeline(timelineId));
        dispatch(expandHomeTimeline(optionalExpandArgs));
      } else if (timelineId === 'community') {
        dispatch(clearTimeline(timelineId));
        dispatch(expandCommunityTimeline(optionalExpandArgs));
      }
    }
  };

interface TimelineDeleteAction {
  type: typeof TIMELINE_DELETE;
  id: string;
  accountId: string;
  references: ImmutableMap<string, readonly [statusId: string, accountId: string]>;
  reblogOf: unknown;
}

const deleteFromTimelines = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const accountId = getState().statuses.get(id)?.account?.id!;
    const references = getState().statuses.filter(status => status.reblog === id).map(status => [status.id, status.account.id] as const);
    const reblogOf = getState().statuses.getIn([id, 'reblog'], null);

    const action: TimelineDeleteAction = {
      type: TIMELINE_DELETE,
      id,
      accountId,
      references,
      reblogOf,
    };

    dispatch(action);
  };

const clearTimeline = (timeline: string) =>
  (dispatch: AppDispatch) =>
    dispatch({ type: TIMELINE_CLEAR, timeline });

const noOp = () => { };
const noOpAsync = () => () => new Promise(f => f(undefined));

const parseTags = (tags: Record<string, any[]> = {}, mode: 'any' | 'all' | 'none') =>
  (tags[mode] || []).map((tag) => tag.value);

const deduplicateStatuses = (statuses: any[]) => {
  const deduplicatedStatuses: any[] = [];

  for (const status of statuses) {
    const reblogged = status.reblog && deduplicatedStatuses.find((deduplicatedStatuses) => deduplicatedStatuses.reblog?.id === status.reblog.id);

    if (reblogged) {
      if (reblogged.accounts) {
        reblogged.accounts.push(status.account);
      } else {
        reblogged.accounts = [reblogged.account, status.account];
      }
      reblogged.id += ':' + status.id;
    } else {
      deduplicatedStatuses.push(status);
    }
  }

  return deduplicatedStatuses;
};

const expandTimeline = (timelineId: string, path: string, params: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const timeline = getState().timelines.get(timelineId) || {} as Record<string, any>;
    const isLoadingMore = !!params.max_id;

    if (timeline.isLoading) {
      done();
      return dispatch(noOpAsync());
    }

    if (
      !params.max_id &&
      !params.pinned &&
      (timeline.items || ImmutableOrderedSet()).size > 0 &&
      !path.includes('max_id=')
    ) {
      params.since_id = timeline.getIn(['items', 0]);
    }

    if (intl && getSettings(getState()).get('autoTranslate')) params.language = intl.locale;

    const isLoadingRecent = !!params.since_id;

    dispatch(expandTimelineRequest(timelineId, isLoadingMore));

    return api(getState)(path, { params }).then(response => {
      dispatch(importFetchedStatuses(response.json));

      const statuses = deduplicateStatuses(response.json);
      dispatch(importFetchedStatuses(statuses.filter(status => status.accounts)));

      dispatch(expandTimelineSuccess(
        timelineId,
        statuses,
        getNextLink(response),
        getPrevLink(response),
        response.status === 206,
        isLoadingRecent,
        isLoadingMore,
      ));
      done();
    }).catch(error => {
      dispatch(expandTimelineFail(timelineId, error, isLoadingMore));
      done();
    });
  };

interface ExpandHomeTimelineOpts {
  maxId?: string;
  url?: string;
}

interface HomeTimelineParams {
  max_id?: string;
  exclude_replies?: boolean;
  with_muted?: boolean;
}

const expandHomeTimeline = ({ url, maxId }: ExpandHomeTimelineOpts = {}, intl?: IntlShape, done = noOp) => {
  const endpoint = url || '/api/v1/timelines/home';
  const params: HomeTimelineParams = {};

  if (!url && maxId) {
    params.max_id = maxId;
  }

  return expandTimeline('home', endpoint, params, intl, done);
};

const expandPublicTimeline = ({ url, maxId, onlyMedia }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`public${onlyMedia ? ':media' : ''}`, url || '/api/v1/timelines/public', url ? {} : { max_id: maxId, only_media: !!onlyMedia }, intl, done);

const expandRemoteTimeline = (instance: string, { url, maxId, onlyMedia }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`remote${onlyMedia ? ':media' : ''}:${instance}`, url || '/api/v1/timelines/public', url ? {} : { local: false, instance: instance, max_id: maxId, only_media: !!onlyMedia }, intl, done);

const expandCommunityTimeline = ({ url, maxId, onlyMedia }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`community${onlyMedia ? ':media' : ''}`, url || '/api/v1/timelines/public', url ? {} : { local: true, max_id: maxId, only_media: !!onlyMedia }, intl, done);

const expandBubbleTimeline = ({ url, maxId, onlyMedia }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`bubble${onlyMedia ? ':media' : ''}`, url || '/api/v1/timelines/bubble', url ? {} : { max_id: maxId, only_media: !!onlyMedia }, intl, done);

const expandDirectTimeline = ({ url, maxId }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline('direct', url || '/api/v1/timelines/direct', url ? {} : { max_id: maxId }, intl, done);

const expandAccountTimeline = (accountId: string, { url, maxId, withReplies }: Record<string, any> = {}, intl?: IntlShape) =>
  expandTimeline(`account:${accountId}${withReplies ? ':with_replies' : ''}`, url || `/api/v1/accounts/${accountId}/statuses`, url ? {} : { exclude_replies: !withReplies, max_id: maxId, with_muted: true }, intl);

const expandAccountFeaturedTimeline = (accountId: string, intl?: IntlShape) =>
  expandTimeline(`account:${accountId}:pinned`, `/api/v1/accounts/${accountId}/statuses`, { pinned: true, with_muted: true }, intl);

const expandAccountMediaTimeline = (accountId: string | number, { url, maxId }: Record<string, any> = {}, intl?: IntlShape) =>
  expandTimeline(`account:${accountId}:media`, url || `/api/v1/accounts/${accountId}/statuses`, url ? {} : { max_id: maxId, only_media: true, limit: 40, with_muted: true }, intl);

const expandListTimeline = (id: string, { url, maxId }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`list:${id}`, url || `/api/v1/timelines/list/${id}`, url ? {} : { max_id: maxId }, intl, done);

const expandGroupTimeline = (id: string, { maxId }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`group:${id}`, `/api/v1/timelines/group/${id}`, { max_id: maxId }, intl, done);

const expandGroupFeaturedTimeline = (id: string, intl?: IntlShape) =>
  expandTimeline(`group:${id}:pinned`, `/api/v1/timelines/group/${id}`, { pinned: true }, intl);

const expandGroupMediaTimeline = (id: string | number, { maxId }: Record<string, any> = {}, intl?: IntlShape) =>
  expandTimeline(`group:${id}:media`, `/api/v1/timelines/group/${id}`, { max_id: maxId, only_media: true, limit: 40, with_muted: true }, intl);

const expandHashtagTimeline = (hashtag: string, { url, maxId, tags }: Record<string, any> = {}, intl?: IntlShape, done = noOp) =>
  expandTimeline(`hashtag:${hashtag}`, url || `/api/v1/timelines/tag/${hashtag}`, url ? {} : {
    max_id: maxId,
    any: parseTags(tags, 'any'),
    all: parseTags(tags, 'all'),
    none: parseTags(tags, 'none'),
  }, intl, done);

const expandTimelineRequest = (timeline: string, isLoadingMore: boolean) => ({
  type: TIMELINE_EXPAND_REQUEST,
  timeline,
  skipLoading: !isLoadingMore,
});

const expandTimelineSuccess = (
  timeline: string,
  statuses: APIEntity[],
  next: string | undefined,
  prev: string | undefined,
  partial: boolean,
  isLoadingRecent: boolean,
  isLoadingMore: boolean,
) => ({
  type: TIMELINE_EXPAND_SUCCESS,
  timeline,
  statuses,
  next,
  prev,
  partial,
  isLoadingRecent,
  skipLoading: !isLoadingMore,
});

const expandTimelineFail = (timeline: string, error: unknown, isLoadingMore: boolean) => ({
  type: TIMELINE_EXPAND_FAIL,
  timeline,
  error,
  skipLoading: !isLoadingMore,
});

const connectTimeline = (timeline: string) => ({
  type: TIMELINE_CONNECT,
  timeline,
});

const disconnectTimeline = (timeline: string) => ({
  type: TIMELINE_DISCONNECT,
  timeline,
});

const scrollTopTimeline = (timeline: string, top: boolean) => ({
  type: TIMELINE_SCROLL_TOP,
  timeline,
  top,
});

const insertSuggestionsIntoTimeline = () => (dispatch: AppDispatch, getState: () => RootState) => {
  dispatch({ type: TIMELINE_INSERT, timeline: 'home' });
};

// TODO: other actions
type TimelineAction = TimelineDeleteAction;

export {
  TIMELINE_UPDATE,
  TIMELINE_DELETE,
  TIMELINE_CLEAR,
  TIMELINE_UPDATE_QUEUE,
  TIMELINE_DEQUEUE,
  TIMELINE_SCROLL_TOP,
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_SUCCESS,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_CONNECT,
  TIMELINE_DISCONNECT,
  TIMELINE_INSERT,
  MAX_QUEUED_ITEMS,
  processTimelineUpdate,
  updateTimeline,
  updateTimelineQueue,
  dequeueTimeline,
  deleteFromTimelines,
  clearTimeline,
  expandTimeline,
  expandHomeTimeline,
  expandPublicTimeline,
  expandRemoteTimeline,
  expandCommunityTimeline,
  expandBubbleTimeline,
  expandDirectTimeline,
  expandAccountTimeline,
  expandAccountFeaturedTimeline,
  expandAccountMediaTimeline,
  expandListTimeline,
  expandGroupTimeline,
  expandGroupFeaturedTimeline,
  expandGroupMediaTimeline,
  expandHashtagTimeline,
  expandTimelineRequest,
  expandTimelineSuccess,
  expandTimelineFail,
  connectTimeline,
  disconnectTimeline,
  scrollTopTimeline,
  insertSuggestionsIntoTimeline,
  type TimelineAction,
};
