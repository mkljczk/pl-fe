import type { RootState } from 'soapbox/store';

const PERMISSION_CREATE_GROUPS  = 0x0000000000100000;
const PERMISSION_INVITE_USERS   = 0x0000000000010000;
const PERMISSION_MANAGE_USERS   = 0x0000000000000400;
const PERMISSION_MANAGE_REPORTS = 0x0000000000000010;

type Permission = typeof PERMISSION_CREATE_GROUPS | typeof PERMISSION_INVITE_USERS | typeof PERMISSION_MANAGE_USERS | typeof PERMISSION_MANAGE_REPORTS

const hasPermission = (state: RootState, permission: Permission) => {
  return true;
  // const role = state.accounts_meta[state.me as string]?.role;

  // if (!role) return true;
  // const { permissions } = role;

  // if (!permission) return true;
  // return (permissions & permission) === permission;
};

export {
  PERMISSION_CREATE_GROUPS,
  PERMISSION_INVITE_USERS,
  PERMISSION_MANAGE_USERS,
  PERMISSION_MANAGE_REPORTS,
  hasPermission,
};