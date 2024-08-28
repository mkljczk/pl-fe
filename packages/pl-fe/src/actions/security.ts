/**
 * Security: Pleroma-specific account management features.
 * @module soapbox/actions/security
 * @see module:soapbox/actions/auth
 */

import { getClient } from 'soapbox/api';
import toast from 'soapbox/toast';
import { getLoggedInAccount } from 'soapbox/utils/auth';
import { normalizeUsername } from 'soapbox/utils/input';

import { AUTH_LOGGED_OUT, messages } from './auth';

import type { AppDispatch, RootState } from 'soapbox/store';

const FETCH_TOKENS_REQUEST = 'FETCH_TOKENS_REQUEST' as const;
const FETCH_TOKENS_SUCCESS = 'FETCH_TOKENS_SUCCESS' as const;
const FETCH_TOKENS_FAIL = 'FETCH_TOKENS_FAIL' as const;

const REVOKE_TOKEN_REQUEST = 'REVOKE_TOKEN_REQUEST' as const;
const REVOKE_TOKEN_SUCCESS = 'REVOKE_TOKEN_SUCCESS' as const;
const REVOKE_TOKEN_FAIL = 'REVOKE_TOKEN_FAIL' as const;

const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST' as const;
const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS' as const;
const RESET_PASSWORD_FAIL = 'RESET_PASSWORD_FAIL' as const;

const RESET_PASSWORD_CONFIRM_REQUEST = 'RESET_PASSWORD_CONFIRM_REQUEST' as const;
const RESET_PASSWORD_CONFIRM_SUCCESS = 'RESET_PASSWORD_CONFIRM_SUCCESS' as const;
const RESET_PASSWORD_CONFIRM_FAIL = 'RESET_PASSWORD_CONFIRM_FAIL' as const;

const CHANGE_PASSWORD_REQUEST = 'CHANGE_PASSWORD_REQUEST' as const;
const CHANGE_PASSWORD_SUCCESS = 'CHANGE_PASSWORD_SUCCESS' as const;
const CHANGE_PASSWORD_FAIL = 'CHANGE_PASSWORD_FAIL' as const;

const CHANGE_EMAIL_REQUEST = 'CHANGE_EMAIL_REQUEST' as const;
const CHANGE_EMAIL_SUCCESS = 'CHANGE_EMAIL_SUCCESS' as const;
const CHANGE_EMAIL_FAIL = 'CHANGE_EMAIL_FAIL' as const;

const DELETE_ACCOUNT_REQUEST = 'DELETE_ACCOUNT_REQUEST' as const;
const DELETE_ACCOUNT_SUCCESS = 'DELETE_ACCOUNT_SUCCESS' as const;
const DELETE_ACCOUNT_FAIL = 'DELETE_ACCOUNT_FAIL' as const;

const MOVE_ACCOUNT_REQUEST = 'MOVE_ACCOUNT_REQUEST' as const;
const MOVE_ACCOUNT_SUCCESS = 'MOVE_ACCOUNT_SUCCESS' as const;
const MOVE_ACCOUNT_FAIL = 'MOVE_ACCOUNT_FAIL' as const;

const fetchOAuthTokens = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: FETCH_TOKENS_REQUEST });
    return getClient(getState).settings.getOauthTokens().then((tokens) => {
      dispatch({ type: FETCH_TOKENS_SUCCESS, tokens });
    }).catch((e) => {
      dispatch({ type: FETCH_TOKENS_FAIL });
    });
  };

const revokeOAuthTokenById = (tokenId: number) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: REVOKE_TOKEN_REQUEST, tokenId });
    return getClient(getState).settings.deleteOauthToken(tokenId).then(() => {
      dispatch({ type: REVOKE_TOKEN_SUCCESS, tokenId });
    }).catch(() => {
      dispatch({ type: REVOKE_TOKEN_FAIL, tokenId });
    });
  };

const changePassword = (oldPassword: string, newPassword: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CHANGE_PASSWORD_REQUEST });

    return getClient(getState).settings.changePassword(oldPassword, newPassword).then(response => {
      dispatch({ type: CHANGE_PASSWORD_SUCCESS, response });
    }).catch(error => {
      dispatch({ type: CHANGE_PASSWORD_FAIL, error, skipAlert: true });
      throw error;
    });
  };

const resetPassword = (usernameOrEmail: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const input = normalizeUsername(usernameOrEmail);

    dispatch({ type: RESET_PASSWORD_REQUEST });

    return getClient(getState).settings.resetPassword(
      input.includes('@') ? input : undefined,
      input.includes('@') ? undefined : input,
    ).then(() => {
      dispatch({ type: RESET_PASSWORD_SUCCESS });
    }).catch(error => {
      dispatch({ type: RESET_PASSWORD_FAIL, error });
      throw error;
    });
  };

const changeEmail = (email: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CHANGE_EMAIL_REQUEST, email });

    return getClient(getState).settings.changeEmail(email, password).then(response => {
      dispatch({ type: CHANGE_EMAIL_SUCCESS, email, response });
    }).catch(error => {
      dispatch({ type: CHANGE_EMAIL_FAIL, email, error, skipAlert: true });
      throw error;
    });
  };

const deleteAccount = (password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: CHANGE_PASSWORD_REQUEST });
    const account = getLoggedInAccount(getState());

    dispatch({ type: DELETE_ACCOUNT_REQUEST });
    return getClient(getState).settings.deleteAccount(password).then(response => {
      dispatch({ type: DELETE_ACCOUNT_SUCCESS, response });
      dispatch({ type: AUTH_LOGGED_OUT, account });
      toast.success(messages.loggedOut);
    }).catch(error => {
      dispatch({ type: DELETE_ACCOUNT_FAIL, error, skipAlert: true });
      throw error;
    });
  };

const moveAccount = (targetAccount: string, password: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch({ type: MOVE_ACCOUNT_REQUEST });
    return getClient(getState).settings.moveAccount(targetAccount, password).then(response => {
      dispatch({ type: MOVE_ACCOUNT_SUCCESS, response });
    }).catch(error => {
      dispatch({ type: MOVE_ACCOUNT_FAIL, error, skipAlert: true });
      throw error;
    });
  };

export {
  FETCH_TOKENS_REQUEST,
  FETCH_TOKENS_SUCCESS,
  FETCH_TOKENS_FAIL,
  REVOKE_TOKEN_REQUEST,
  REVOKE_TOKEN_SUCCESS,
  REVOKE_TOKEN_FAIL,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  RESET_PASSWORD_CONFIRM_REQUEST,
  RESET_PASSWORD_CONFIRM_SUCCESS,
  RESET_PASSWORD_CONFIRM_FAIL,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  CHANGE_EMAIL_REQUEST,
  CHANGE_EMAIL_SUCCESS,
  CHANGE_EMAIL_FAIL,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
  MOVE_ACCOUNT_REQUEST,
  MOVE_ACCOUNT_SUCCESS,
  MOVE_ACCOUNT_FAIL,
  fetchOAuthTokens,
  revokeOAuthTokenById,
  changePassword,
  resetPassword,
  changeEmail,
  deleteAccount,
  moveAccount,
};
