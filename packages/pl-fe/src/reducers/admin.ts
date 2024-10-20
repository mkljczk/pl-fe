import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  OrderedSet as ImmutableOrderedSet,
  fromJS,
} from 'immutable';
import omit from 'lodash/omit';

import {
  ADMIN_CONFIG_FETCH_SUCCESS,
  ADMIN_CONFIG_UPDATE_SUCCESS,
  ADMIN_REPORTS_FETCH_SUCCESS,
  ADMIN_REPORT_PATCH_SUCCESS,
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USER_DELETE_SUCCESS,
  ADMIN_USER_APPROVE_REQUEST,
  ADMIN_USER_APPROVE_SUCCESS,
} from 'pl-fe/actions/admin';
import { normalizeAdminReport, type AdminReport } from 'pl-fe/normalizers/admin-report';

import type { AdminAccount, AdminGetAccountsParams, AdminReport as BaseAdminReport } from 'pl-api';
import type { Config } from 'pl-fe/utils/config-db';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  reports: ImmutableMap<string, MinifiedReport>(),
  openReports: ImmutableOrderedSet<string>(),
  users: ImmutableMap<string, MinifiedUser>(),
  latestUsers: ImmutableOrderedSet<string>(),
  awaitingApproval: ImmutableOrderedSet<string>(),
  configs: ImmutableList<Config>(),
  needsReboot: false,
});

type State = ReturnType<typeof ReducerRecord>;

// Lol https://javascript.plainenglish.io/typescript-essentials-conditionally-filter-types-488705bfbf56
type FilterConditionally<Source, Condition> = Pick<Source, {[K in keyof Source]: Source[K] extends Condition ? K : never}[keyof Source]>;

type SetKeys = keyof FilterConditionally<State, ImmutableOrderedSet<string>>;

const toIds = (items: any[]) => items.map(item => item.id);

const mergeSet = (state: State, key: SetKeys, users: Array<AdminAccount>): State => {
  const newIds = toIds(users);
  return state.update(key, (ids: ImmutableOrderedSet<string>) => ids.union(newIds));
};

const replaceSet = (state: State, key: SetKeys, users: Array<AdminAccount>): State => {
  const newIds = toIds(users);
  return state.set(key, ImmutableOrderedSet(newIds));
};

const maybeImportUnapproved = (state: State, users: Array<AdminAccount>, params?: AdminGetAccountsParams): State => {
  if (params?.origin === 'local' && params.status === 'pending') {
    return mergeSet(state, 'awaitingApproval', users);
  } else {
    return state;
  }
};

const maybeImportLatest = (state: State, users: Array<AdminAccount>, params?: AdminGetAccountsParams): State => {
  if (params?.origin === 'local' && params.status === 'active') {
    return replaceSet(state, 'latestUsers', users);
  } else {
    return state;
  }
};

const minifyUser = (user: AdminAccount) => omit(user, ['account']);

type MinifiedUser = ReturnType<typeof minifyUser>;

const importUsers = (state: State, users: Array<AdminAccount>, params: AdminGetAccountsParams): State =>
  state.withMutations(state => {
    maybeImportUnapproved(state, users, params);
    maybeImportLatest(state, users, params);

    users.forEach(user => {
      const normalizedUser = minifyUser(user);
      state.setIn(['users', user.id], normalizedUser);
    });
  });

const deleteUser = (state: State, accountId: string): State =>
  state
    .update('awaitingApproval', orderedSet => orderedSet.delete(accountId))
    .deleteIn(['users', accountId]);

const approveUser = (state: State, user: AdminAccount): State =>
  state.withMutations(state => {
    const normalizedUser = minifyUser(user);
    state.update('awaitingApproval', orderedSet => orderedSet.delete(user.id));
    state.setIn(['users', user.id], normalizedUser);
  });

const minifyReport = (report: AdminReport) => omit(
  report,
  ['account', 'target_account', 'action_taken_by_account', 'assigned_account', 'statuses'],
);

type MinifiedReport = ReturnType<typeof minifyReport>;

const importReports = (state: State, reports: Array<BaseAdminReport>): State =>
  state.withMutations(state => {
    reports.forEach(report => {
      const minifiedReport = minifyReport(normalizeAdminReport(report));
      if (!minifiedReport.action_taken) {
        state.update('openReports', orderedSet => orderedSet.add(report.id));
      }
      state.setIn(['reports', report.id], minifiedReport);
    });
  });

const handleReportDiffs = (state: State, report: MinifiedReport) =>
  // Note: the reports here aren't full report objects
  // hence the need for a new function.
  state.withMutations(state => {
    switch (report.action_taken) {
      case false:
        state.update('openReports', orderedSet => orderedSet.add(report.id));
        break;
      default:
        state.update('openReports', orderedSet => orderedSet.delete(report.id));
    }
  });

const normalizeConfig = (config: any): Config => ImmutableMap(fromJS(config));

const normalizeConfigs = (configs: any): ImmutableList<Config> => ImmutableList(fromJS(configs)).map(normalizeConfig);

const importConfigs = (state: State, configs: any): State => state.set('configs', normalizeConfigs(configs));

const admin = (state: State = ReducerRecord(), action: AnyAction): State => {
  switch (action.type) {
    case ADMIN_CONFIG_FETCH_SUCCESS:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return importConfigs(state, action.configs);
    case ADMIN_REPORTS_FETCH_SUCCESS:
      return importReports(state, action.reports);
    case ADMIN_REPORT_PATCH_SUCCESS:
      return handleReportDiffs(state, action.report);
    case ADMIN_USERS_FETCH_SUCCESS:
      return importUsers(state, action.users, action.params);
    case ADMIN_USER_DELETE_SUCCESS:
      return deleteUser(state, action.accountId);
    case ADMIN_USER_APPROVE_REQUEST:
      return state.update('awaitingApproval', set => set.subtract(action.accountId));
    case ADMIN_USER_APPROVE_SUCCESS:
      return approveUser(state, action.user);
    default:
      return state;
  }
};

export { admin as default };
