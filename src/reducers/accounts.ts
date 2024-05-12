import {
  Map as ImmutableMap,
  List as ImmutableList,
  OrderedSet as ImmutableOrderedSet,
  fromJS,
} from 'immutable';

import {
  ADMIN_USERS_FETCH_SUCCESS,
  ADMIN_USERS_TAG_REQUEST,
  ADMIN_USERS_TAG_SUCCESS,
  ADMIN_USERS_TAG_FAIL,
  ADMIN_USERS_UNTAG_REQUEST,
  ADMIN_USERS_UNTAG_SUCCESS,
  ADMIN_USERS_UNTAG_FAIL,
  ADMIN_ADD_PERMISSION_GROUP_REQUEST,
  ADMIN_ADD_PERMISSION_GROUP_SUCCESS,
  ADMIN_ADD_PERMISSION_GROUP_FAIL,
  ADMIN_REMOVE_PERMISSION_GROUP_REQUEST,
  ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS,
  ADMIN_REMOVE_PERMISSION_GROUP_FAIL,
  ADMIN_USERS_DELETE_REQUEST,
  ADMIN_USERS_DELETE_FAIL,
  ADMIN_USERS_DEACTIVATE_REQUEST,
  ADMIN_USERS_DEACTIVATE_FAIL,
} from 'soapbox/actions/admin';
import {
  ACCOUNT_IMPORT,
  ACCOUNTS_IMPORT,
  ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP,
} from 'soapbox/actions/importer';
import { normalizeAccount } from 'soapbox/normalizers/account';
import { normalizeId } from 'soapbox/utils/normalizers';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

type AccountRecord = ReturnType<typeof normalizeAccount>;
type AccountMap = ImmutableMap<string, any>;

export interface ReducerAccount extends AccountRecord {
  moved: string | null;
}

type State = ImmutableMap<any, ReducerAccount>;

const initialState: State = ImmutableMap();

const minifyAccount = (account: AccountRecord): ReducerAccount =>
  account.mergeWith((o, n) => n || o, {
    moved: normalizeId(account.getIn(['moved', 'id'])),
  }) as ReducerAccount;

const fixAccount = (state: State, account: APIEntity) => {
  const normalized = minifyAccount(normalizeAccount(account));
  return state.set(account.id, normalized);
};

const normalizeAccounts = (state: State, accounts: ImmutableList<AccountMap>) => {
  accounts.forEach(account => {
    state = fixAccount(state, account);
  });

  return state;
};

const addTags = (
  state: State,
  accountIds: Array<string>,
  tags: Array<string>,
): State => state.withMutations(state => {
  accountIds.forEach(id => {
    state.updateIn([id, 'pleroma', 'tags'], ImmutableList(), v =>
      ImmutableOrderedSet(fromJS(v)).union(tags).toList(),
    );

    tags.forEach(tag => {
      switch (tag) {
        case 'verified':
          state.setIn([id, 'verified'], true);
          break;
        case 'donor':
          state.setIn([id, 'donor'], true);
          break;
      }
    });
  });
});

const removeTags = (
  state: State,
  accountIds: Array<string>,
  tags: Array<string>,
): State => state.withMutations(state => {
  accountIds.forEach(id => {
    state.updateIn([id, 'pleroma', 'tags'], ImmutableList(), v =>
      ImmutableOrderedSet(fromJS(v)).subtract(tags).toList(),
    );

    tags.forEach(tag => {
      switch (tag) {
        case 'verified':
          state.setIn([id, 'verified'], false);
          break;
        case 'donor':
          state.setIn([id, 'donor'], false);
          break;
      }
    });
  });
});

const setActive = (state: State, accountIds: Array<string>, active: boolean): State =>
  state.withMutations(state => {
    accountIds.forEach(id => {
      state.setIn([id, 'pleroma', 'is_active'], active);
    });
  });

const permissionGroupFields: Record<string, string> = {
  admin: 'is_admin',
  moderator: 'is_moderator',
};

const addPermission = (
  state: State,
  accountIds: Array<string>,
  permissionGroup: string,
): State => {
  const field = permissionGroupFields[permissionGroup];
  if (!field) return state;

  return state.withMutations(state => {
    accountIds.forEach(id => {
      state.setIn([id, 'pleroma', field], true);
    });
  });
};

const removePermission = (
  state: State,
  accountIds: Array<string>,
  permissionGroup: string,
): State => {
  const field = permissionGroupFields[permissionGroup];
  if (!field) return state;

  return state.withMutations(state => {
    accountIds.forEach(id => {
      state.setIn([id, 'pleroma', field], false);
    });
  });
};

const buildAccount = (adminUser: ImmutableMap<string, any>): AccountRecord => normalizeAccount({
  id: adminUser.get('id'),
  username: adminUser.get('nickname').split('@')[0],
  acct: adminUser.get('nickname'),
  display_name: adminUser.get('display_name'),
  display_name_html: adminUser.get('display_name'),
  url: adminUser.get('url'),
  avatar: adminUser.get('avatar'),
  avatar_static: adminUser.get('avatar'),
  created_at: adminUser.get('created_at'),
  pleroma: {
    is_active: adminUser.get('is_active'),
    is_confirmed: adminUser.get('is_confirmed'),
    is_admin: adminUser.getIn(['roles', 'admin']),
    is_moderator: adminUser.getIn(['roles', 'moderator']),
    tags: adminUser.get('tags'),
  },
  source: {
    pleroma: {
      actor_type: adminUser.get('actor_type'),
    },
  },
  should_refetch: true,
});

const mergeAdminUser = (
  account: AccountRecord,
  adminUser: ImmutableMap<string, any>,
) => account.withMutations(account => {
  account.set('display_name', adminUser.get('display_name'));
  account.set('avatar', adminUser.get('avatar'));
  account.set('avatar_static', adminUser.get('avatar'));
  account.setIn(['pleroma', 'is_active'], adminUser.get('is_active'));
  account.setIn(['pleroma', 'is_admin'], adminUser.getIn(['roles', 'admin']));
  account.setIn(['pleroma', 'is_moderator'], adminUser.getIn(['roles', 'moderator']));
  account.setIn(['pleroma', 'is_confirmed'], adminUser.get('is_confirmed'));
  account.setIn(['pleroma', 'tags'], adminUser.get('tags'));
});

const importAdminUser = (state: State, adminUser: ImmutableMap<string, any>): State => {
  const id = adminUser.get('id');
  const account = state.get(id);

  if (!account) {
    return state.set(id, minifyAccount(buildAccount(adminUser)));
  } else {
    return state.set(id, minifyAccount(mergeAdminUser(account, adminUser)));
  }
};

const importAdminUsers = (state: State, adminUsers: Array<Record<string, any>>): State =>
  state.withMutations((state: State) => {
    adminUsers.filter(adminUser => !adminUser.account).forEach(adminUser => {
      importAdminUser(state, ImmutableMap(fromJS(adminUser)));
    });
  });

const accounts = (state: State = initialState, action: AnyAction): State => {
  switch (action.type) {
    case ACCOUNT_IMPORT:
      return fixAccount(state, action.account);
    case ACCOUNTS_IMPORT:
      return normalizeAccounts(state, action.accounts);
    case ACCOUNT_FETCH_FAIL_FOR_USERNAME_LOOKUP:
      return fixAccount(state, { id: -1, username: action.username });
    case ADMIN_USERS_TAG_REQUEST:
    case ADMIN_USERS_TAG_SUCCESS:
    case ADMIN_USERS_UNTAG_FAIL:
      return addTags(state, action.accountIds, action.tags);
    case ADMIN_USERS_UNTAG_REQUEST:
    case ADMIN_USERS_UNTAG_SUCCESS:
    case ADMIN_USERS_TAG_FAIL:
      return removeTags(state, action.accountIds, action.tags);
    case ADMIN_ADD_PERMISSION_GROUP_REQUEST:
    case ADMIN_ADD_PERMISSION_GROUP_SUCCESS:
    case ADMIN_REMOVE_PERMISSION_GROUP_FAIL:
      return addPermission(state, action.accountIds, action.permissionGroup);
    case ADMIN_REMOVE_PERMISSION_GROUP_REQUEST:
    case ADMIN_REMOVE_PERMISSION_GROUP_SUCCESS:
    case ADMIN_ADD_PERMISSION_GROUP_FAIL:
      return removePermission(state, action.accountIds, action.permissionGroup);
    case ADMIN_USERS_DELETE_REQUEST:
    case ADMIN_USERS_DEACTIVATE_REQUEST:
      return setActive(state, action.accountIds, false);
    case ADMIN_USERS_DELETE_FAIL:
    case ADMIN_USERS_DEACTIVATE_FAIL:
      return setActive(state, action.accountIds, true);
    case ADMIN_USERS_FETCH_SUCCESS:
      return importAdminUsers(state, action.users);
    default:
      return state;
  }
};

export default accounts;
