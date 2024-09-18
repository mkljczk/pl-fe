import { Record as ImmutableRecord } from 'immutable';

import {
  MFA_CONFIRM_SUCCESS,
  MFA_DISABLE_SUCCESS,
  MFA_FETCH_SUCCESS,
} from '../actions/mfa';
import {
  FETCH_TOKENS_SUCCESS,
  REVOKE_TOKEN_SUCCESS,
} from '../actions/security';

import type { OauthToken } from 'pl-api';
import type { AnyAction } from 'redux';

const ReducerRecord = ImmutableRecord({
  tokens: [] as Array<OauthToken>,
  mfa: {
    settings: {
      totp: false,
    },
  },
});

type State = ReturnType<typeof ReducerRecord>;

const deleteToken = (state: State, tokenId: number) =>
  state.update('tokens', (tokens) =>
    tokens.filter((token) => token.id !== tokenId),
  );

const importMfa = (state: State, data: any) => state.set('mfa', data);

const enableMfa = (state: State, method: string) =>
  state.update('mfa', (mfa) => ({
    settings: { ...mfa.settings, [method]: true },
  }));

const disableMfa = (state: State, method: string) =>
  state.update('mfa', (mfa) => ({
    settings: { ...mfa.settings, [method]: false },
  }));

const security = (state = ReducerRecord(), action: AnyAction) => {
  switch (action.type) {
    case FETCH_TOKENS_SUCCESS:
      return state.set('tokens', action.tokens);
    case REVOKE_TOKEN_SUCCESS:
      return deleteToken(state, action.tokenId);
    case MFA_FETCH_SUCCESS:
      return importMfa(state, action.data);
    case MFA_CONFIRM_SUCCESS:
      return enableMfa(state, action.method);
    case MFA_DISABLE_SUCCESS:
      return disableMfa(state, action.method);
    default:
      return state;
  }
};

export { security as default };
