
import { fetchRelationships } from 'pl-fe/actions/accounts';
import { importFetchedAccount, importFetchedAccounts, importFetchedStatuses } from 'pl-fe/actions/importer';
import { accountIdsToAccts } from 'pl-fe/selectors';
import { filterBadges, getTagDiff } from 'pl-fe/utils/badges';

import { getClient } from '../api';

import type { Account, AdminGetAccountsParams, AdminGetReportsParams } from 'pl-api';
import type { AppDispatch, RootState } from 'pl-fe/store';

const ADMIN_CONFIG_FETCH_REQUEST = 'ADMIN_CONFIG_FETCH_REQUEST' as const;
const ADMIN_CONFIG_FETCH_SUCCESS = 'ADMIN_CONFIG_FETCH_SUCCESS' as const;
const ADMIN_CONFIG_FETCH_FAIL = 'ADMIN_CONFIG_FETCH_FAIL' as const;

const ADMIN_CONFIG_UPDATE_REQUEST = 'ADMIN_CONFIG_UPDATE_REQUEST' as const;
const ADMIN_CONFIG_UPDATE_SUCCESS = 'ADMIN_CONFIG_UPDATE_SUCCESS' as const;
const ADMIN_CONFIG_UPDATE_FAIL = 'ADMIN_CONFIG_UPDATE_FAIL' as const;

const ADMIN_REPORTS_FETCH_REQUEST = 'ADMIN_REPORTS_FETCH_REQUEST' as const;
const ADMIN_REPORTS_FETCH_SUCCESS = 'ADMIN_REPORTS_FETCH_SUCCESS' as const;
const ADMIN_REPORTS_FETCH_FAIL = 'ADMIN_REPORTS_FETCH_FAIL' as const;

const ADMIN_REPORT_PATCH_REQUEST = 'ADMIN_REPORT_PATCH_REQUEST' as const;
const ADMIN_REPORT_PATCH_SUCCESS = 'ADMIN_REPORT_PATCH_SUCCESS' as const;
const ADMIN_REPORT_PATCH_FAIL = 'ADMIN_REPORT_PATCH_FAIL' as const;

const ADMIN_USERS_FETCH_REQUEST = 'ADMIN_USERS_FETCH_REQUEST' as const;
const ADMIN_USERS_FETCH_SUCCESS = 'ADMIN_USERS_FETCH_SUCCESS' as const;
const ADMIN_USERS_FETCH_FAIL = 'ADMIN_USERS_FETCH_FAIL' as const;

const ADMIN_USER_DELETE_REQUEST = 'ADMIN_USER_DELETE_REQUEST' as const;
const ADMIN_USER_DELETE_SUCCESS = 'ADMIN_USER_DELETE_SUCCESS' as const;
const ADMIN_USER_DELETE_FAIL = 'ADMIN_USER_DELETE_FAIL' as const;

const ADMIN_USER_APPROVE_REQUEST = 'ADMIN_USER_APPROVE_REQUEST' as const;
const ADMIN_USER_APPROVE_SUCCESS = 'ADMIN_USER_APPROVE_SUCCESS' as const;
const ADMIN_USER_APPROVE_FAIL = 'ADMIN_USER_APPROVE_FAIL' as const;

const ADMIN_USER_DEACTIVATE_REQUEST = 'ADMIN_USER_DEACTIVATE_REQUEST' as const;
const ADMIN_USER_DEACTIVATE_SUCCESS = 'ADMIN_USER_DEACTIVATE_SUCCESS' as const;
const ADMIN_USER_DEACTIVATE_FAIL = 'ADMIN_USER_DEACTIVATE_FAIL' as const;

const ADMIN_STATUS_DELETE_REQUEST = 'ADMIN_STATUS_DELETE_REQUEST' as const;
const ADMIN_STATUS_DELETE_SUCCESS = 'ADMIN_STATUS_DELETE_SUCCESS' as const;
const ADMIN_STATUS_DELETE_FAIL = 'ADMIN_STATUS_DELETE_FAIL' as const;

const ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST' as const;
const ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS' as const;
const ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL = 'ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL' as const;

const ADMIN_USERS_TAG_REQUEST = 'ADMIN_USERS_TAG_REQUEST' as const;
const ADMIN_USERS_TAG_SUCCESS = 'ADMIN_USERS_TAG_SUCCESS' as const;
const ADMIN_USERS_TAG_FAIL = 'ADMIN_USERS_TAG_FAIL' as const;

const ADMIN_USERS_UNTAG_REQUEST = 'ADMIN_USERS_UNTAG_REQUEST' as const;
const ADMIN_USERS_UNTAG_SUCCESS = 'ADMIN_USERS_UNTAG_SUCCESS' as const;
const ADMIN_USERS_UNTAG_FAIL = 'ADMIN_USERS_UNTAG_FAIL' as const;

const ADMIN_USER_INDEX_EXPAND_FAIL = 'ADMIN_USER_INDEX_EXPAND_FAIL' as const;
const ADMIN_USER_INDEX_EXPAND_REQUEST = 'ADMIN_USER_INDEX_EXPAND_REQUEST' as const;
const ADMIN_USER_INDEX_EXPAND_SUCCESS = 'ADMIN_USER_INDEX_EXPAND_SUCCESS' as const;

const ADMIN_USER_INDEX_FETCH_FAIL = 'ADMIN_USER_INDEX_FETCH_FAIL' as const;
const ADMIN_USER_INDEX_FETCH_REQUEST = 'ADMIN_USER_INDEX_FETCH_REQUEST' as const;
const ADMIN_USER_INDEX_FETCH_SUCCESS = 'ADMIN_USER_INDEX_FETCH_SUCCESS' as const;

const ADMIN_USER_INDEX_QUERY_SET = 'ADMIN_USER_INDEX_QUERY_SET' as const;

const fetchConfig = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_FETCH_REQUEST });
    return getClient(getState).request('/api/v1/pleroma/admin/config')
      .then(({ json: data }) => {
        dispatch({ type: ADMIN_CONFIG_FETCH_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_FETCH_FAIL, error });
      });
  };

const updateConfig = (configs: Record<string, any>[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_CONFIG_UPDATE_REQUEST, configs });
    return getClient(getState).request('/api/v1/pleroma/admin/config', { method: 'POST', body: { configs } })
      .then(({ json: data }) => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_SUCCESS, configs: data.configs, needsReboot: data.need_reboot });
      }).catch(error => {
        dispatch({ type: ADMIN_CONFIG_UPDATE_FAIL, error, configs });
      });
  };

const updatePlFeConfig = (data: Record<string, any>) =>
  (dispatch: AppDispatch) => {
    const params = [{
      group: ':pleroma',
      key: ':frontend_configurations',
      value: [{
        tuple: [':pl_fe', data],
      }],
    }];

    return dispatch(updateConfig(params));
  };

const fetchReports = (params?: AdminGetReportsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_REPORTS_FETCH_REQUEST, params });

    return getClient(state).admin.reports.getReports(params)
      .then(({ items }) => {
        items.forEach((report) => {
          if (report.account?.account) dispatch(importFetchedAccount(report.account.account));
          if (report.target_account?.account) dispatch(importFetchedAccount(report.target_account.account));
          dispatch(importFetchedStatuses(report.statuses));
          dispatch({ type: ADMIN_REPORTS_FETCH_SUCCESS, reports: items, params });
        });
      }).catch(error => {
        dispatch({ type: ADMIN_REPORTS_FETCH_FAIL, error, params });
      });
  };

const closeReport = (reportId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_REPORT_PATCH_REQUEST, reportId });

    return getClient(state).admin.reports.resolveReport(reportId).then(() => {
      dispatch({ type: ADMIN_REPORT_PATCH_SUCCESS, reportId });
    }).catch(error => {
      dispatch({ type: ADMIN_REPORT_PATCH_FAIL, error, reportId });
    });
  };

const fetchUsers = (params?: AdminGetAccountsParams) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_USERS_FETCH_REQUEST, params });

    return getClient(state).admin.accounts.getAccounts(params).then((res) => {
      dispatch(importFetchedAccounts(res.items.map(({ account }) => account).filter((account): account is Account => account !== null)));
      dispatch(fetchRelationships(res.items.map((account) => account.id)));
      dispatch({ type: ADMIN_USERS_FETCH_SUCCESS, users: res.items, params, next: res.next });
      return res;
    }).catch(error => {
      dispatch({ type: ADMIN_USERS_FETCH_FAIL, error, params });
      throw error;
    });
  };

const deactivateUser = (accountId: string, report_id?: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_USER_DEACTIVATE_REQUEST, accountId });

    return getClient(state).admin.accounts.performAccountAction(accountId, 'suspend', { report_id });
  };

const deleteUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_USER_DELETE_REQUEST, accountId });

    return getClient(getState).admin.accounts.deleteAccount(accountId)
      .then(() => {
        dispatch({ type: ADMIN_USER_DELETE_SUCCESS, accountId });
      }).catch(error => {
        dispatch({ type: ADMIN_USER_DELETE_FAIL, error, accountId });
      });
  };

const approveUser = (accountId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();

    dispatch({ type: ADMIN_USER_APPROVE_REQUEST, accountId });

    return getClient(state).admin.accounts.approveAccount(accountId)
      .then((user) => {
        dispatch({ type: ADMIN_USER_APPROVE_SUCCESS, user, accountId });
      }).catch(error => {
        dispatch({ type: ADMIN_USER_APPROVE_FAIL, error, accountId });
      });
  };

const deleteStatus = (statusId: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_DELETE_REQUEST, statusId });
    return getClient(getState).admin.statuses.deleteStatus(statusId)
      .then(() => {
        dispatch({ type: ADMIN_STATUS_DELETE_SUCCESS, statusId });
      }).catch(error => {
        dispatch({ type: ADMIN_STATUS_DELETE_FAIL, error, statusId });
      });
  };

const toggleStatusSensitivity = (statusId: string, sensitive: boolean) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST, statusId });
    return getClient(getState).admin.statuses.updateStatus(statusId, { sensitive: !sensitive })
      .then(() => {
        dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS, statusId });
      }).catch(error => {
        dispatch({ type: ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL, error, statusId });
      });
  };

const tagUsers = (accountIds: string[], tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);
    dispatch({ type: ADMIN_USERS_TAG_REQUEST, accountIds, tags });
    return getClient(getState).request('/api/v1/pleroma/admin/users/tag', {
      method: 'PUT',
      body: { nicknames, tags },
    }).then(() => {
      dispatch({ type: ADMIN_USERS_TAG_SUCCESS, accountIds, tags });
    }).catch(error => {
      dispatch({ type: ADMIN_USERS_TAG_FAIL, error, accountIds, tags });
    });
  };

const untagUsers = (accountIds: string[], tags: string[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const nicknames = accountIdsToAccts(getState(), accountIds);

    dispatch({ type: ADMIN_USERS_UNTAG_REQUEST, accountIds, tags });
    return getClient(getState).request('/api/v1/pleroma/admin/users/tag', {
      method: 'DELETE',
      body: { nicknames, tags },
    })
      .then(() => {
        dispatch({ type: ADMIN_USERS_UNTAG_SUCCESS, accountIds, tags });
      }).catch(error => {
        dispatch({ type: ADMIN_USERS_UNTAG_FAIL, error, accountIds, tags });
      });
  };

/** Synchronizes user tags to the backend. */
const setTags = (accountId: string, oldTags: string[], newTags: string[]) =>
  async(dispatch: AppDispatch) => {
    const diff = getTagDiff(oldTags, newTags);

    if (diff.added.length) await dispatch(tagUsers([accountId], diff.added));
    if (diff.removed.length) await dispatch(untagUsers([accountId], diff.removed));
  };

/** Synchronizes badges to the backend. */
const setBadges = (accountId: string, oldTags: string[], newTags: string[]) =>
  (dispatch: AppDispatch) => {
    const oldBadges = filterBadges(oldTags);
    const newBadges = filterBadges(newTags);

    return dispatch(setTags(accountId, oldBadges, newBadges));
  };

const promoteToAdmin = (accountId: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.promoteToAdmin(accountId);

const promoteToModerator = (accountId: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.promoteToModerator(accountId);

const demoteToUser = (accountId: string) =>
  (_dispatch: AppDispatch, getState: () => RootState) =>
    getClient(getState).admin.accounts.demoteToUser(accountId);

const setRole = (accountId: string, role: 'user' | 'moderator' | 'admin') =>
  (dispatch: AppDispatch) => {
    switch (role) {
      case 'user':
        return dispatch(demoteToUser(accountId));
      case 'moderator':
        return dispatch(promoteToModerator(accountId));
      case 'admin':
        return dispatch(promoteToAdmin(accountId));
    }
  };

const setUserIndexQuery = (query: string) => ({ type: ADMIN_USER_INDEX_QUERY_SET, query });

const fetchUserIndex = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { query, isLoading } = getState().admin_user_index;

    if (isLoading) return;

    dispatch({ type: ADMIN_USER_INDEX_FETCH_REQUEST });

    const params: AdminGetAccountsParams = {
      origin: 'local',
      status: 'active',
      username: query,
    };

    dispatch(fetchUsers(params))
      .then((data) => {
        const { items, total, next } = data;
        dispatch({ type: ADMIN_USER_INDEX_FETCH_SUCCESS, users: items, total, next, params });
      }).catch(() => {
        dispatch({ type: ADMIN_USER_INDEX_FETCH_FAIL });
      });
  };

const expandUserIndex = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const { params, next, isLoading, loaded } = getState().admin_user_index;

    if (!loaded || isLoading || !next) return;

    dispatch({ type: ADMIN_USER_INDEX_EXPAND_REQUEST });

    next()
      .then((data) => {
        const { items, total, next } = data;
        dispatch({ type: ADMIN_USER_INDEX_EXPAND_SUCCESS, users: items, total, next, params });
      }).catch(() => {
        dispatch({ type: ADMIN_USER_INDEX_EXPAND_FAIL });
      });
  };

const getSubscribersCsv = () =>
  (dispatch: any, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/admin/email_list/subscribers.csv', { contentType: '' });

const getUnsubscribersCsv = () =>
  (dispatch: any, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/admin/email_list/unsubscribers.csv', { contentType: '' });

const getCombinedCsv = () =>
  (dispatch: any, getState: () => RootState) =>
    getClient(getState).request('/api/v1/pleroma/admin/email_list/combined.csv', { contentType: '' });

export {
  ADMIN_CONFIG_FETCH_REQUEST,
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_FETCH_FAIL,
  ADMIN_CONFIG_UPDATE_REQUEST,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_CONFIG_UPDATE_FAIL,
  ADMIN_REPORTS_FETCH_REQUEST,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORTS_FETCH_FAIL,
  ADMIN_REPORT_PATCH_REQUEST,
  ADMIN_REPORT_PATCH_SUCCESS,
  ADMIN_REPORT_PATCH_FAIL,
  ADMIN_USERS_FETCH_REQUEST,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USERS_FETCH_FAIL,
  ADMIN_USER_DELETE_REQUEST,
  ADMIN_USER_DELETE_SUCCESS,
  ADMIN_USER_DELETE_FAIL,
  ADMIN_USER_APPROVE_REQUEST,
  ADMIN_USER_APPROVE_SUCCESS,
  ADMIN_USER_APPROVE_FAIL,
  ADMIN_USER_DEACTIVATE_REQUEST,
  ADMIN_USER_DEACTIVATE_SUCCESS,
  ADMIN_USER_DEACTIVATE_FAIL,
  ADMIN_STATUS_DELETE_REQUEST,
  ADMIN_STATUS_DELETE_SUCCESS,
  ADMIN_STATUS_DELETE_FAIL,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_REQUEST,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_SUCCESS,
  ADMIN_STATUS_TOGGLE_SENSITIVITY_FAIL,
  ADMIN_USERS_TAG_REQUEST,
  ADMIN_USERS_TAG_SUCCESS,
  ADMIN_USERS_TAG_FAIL,
  ADMIN_USERS_UNTAG_REQUEST,
  ADMIN_USERS_UNTAG_SUCCESS,
  ADMIN_USERS_UNTAG_FAIL,
  ADMIN_USER_INDEX_EXPAND_FAIL,
  ADMIN_USER_INDEX_EXPAND_REQUEST,
  ADMIN_USER_INDEX_EXPAND_SUCCESS,
  ADMIN_USER_INDEX_FETCH_FAIL,
  ADMIN_USER_INDEX_FETCH_REQUEST,
  ADMIN_USER_INDEX_FETCH_SUCCESS,
  ADMIN_USER_INDEX_QUERY_SET,
  fetchConfig,
  updateConfig,
  updatePlFeConfig,
  fetchReports,
  closeReport,
  fetchUsers,
  deactivateUser,
  deleteUser,
  approveUser,
  deleteStatus,
  toggleStatusSensitivity,
  tagUsers,
  untagUsers,
  setTags,
  setBadges,
  promoteToAdmin,
  promoteToModerator,
  demoteToUser,
  setRole,
  setUserIndexQuery,
  fetchUserIndex,
  expandUserIndex,
  getSubscribersCsv,
  getUnsubscribersCsv,
  getCombinedCsv,
};
