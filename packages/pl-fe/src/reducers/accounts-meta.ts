/**
 * Accounts Meta: private user data only the owner should see.
 * @module pl-fe/reducers/accounts_meta
 */

import { produce } from 'immer';
import { Account, accountSchema } from 'pl-api';

import { VERIFY_CREDENTIALS_SUCCESS, AUTH_ACCOUNT_REMEMBER_SUCCESS } from 'pl-fe/actions/auth';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS } from 'pl-fe/actions/me';

import type { AnyAction } from 'redux';

interface AccountMeta {
  pleroma: Account['__meta']['pleroma'];
  source: Account['__meta']['source'];
}

type State = Record<string, AccountMeta | undefined>;

const importAccount = (state: State, data: unknown): State => {
  const result = accountSchema.safeParse(data);

  if (!result.success) {
    return state;
  }

  const account = result.data;

  return produce(state, draft => {
    const existing = draft[account.id];

    draft[account.id] = {
      pleroma: account.__meta.pleroma ?? existing?.pleroma,
      source: account.__meta.source ?? existing?.source,
    };
  });
};

const accounts_meta = (state: Readonly<State> = {}, action: AnyAction): State => {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return importAccount(state, action.me);
    case VERIFY_CREDENTIALS_SUCCESS:
    case AUTH_ACCOUNT_REMEMBER_SUCCESS:
      return importAccount(state, action.account);
    default:
      return state;
  }
};

export { accounts_meta as default };
