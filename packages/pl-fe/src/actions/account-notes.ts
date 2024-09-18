import { getClient } from '../api';

import type { RootState } from 'pl-fe/store';
import type { AnyAction } from 'redux';

const ACCOUNT_NOTE_SUBMIT_REQUEST = 'ACCOUNT_NOTE_SUBMIT_REQUEST' as const;
const ACCOUNT_NOTE_SUBMIT_SUCCESS = 'ACCOUNT_NOTE_SUBMIT_SUCCESS' as const;
const ACCOUNT_NOTE_SUBMIT_FAIL = 'ACCOUNT_NOTE_SUBMIT_FAIL' as const;

const submitAccountNote =
  (accountId: string, value: string) =>
  (dispatch: React.Dispatch<AnyAction>, getState: () => RootState) => {
    dispatch(submitAccountNoteRequest(accountId));

    return getClient(getState)
      .accounts.updateAccountNote(accountId, value)
      .then((response) => {
        dispatch(submitAccountNoteSuccess(response));
      })
      .catch((error) => dispatch(submitAccountNoteFail(accountId, error)));
  };

const submitAccountNoteRequest = (accountId: string) => ({
  type: ACCOUNT_NOTE_SUBMIT_REQUEST,
  accountId,
});

const submitAccountNoteSuccess = (relationship: any) => ({
  type: ACCOUNT_NOTE_SUBMIT_SUCCESS,
  accountId: relationship.id,
  relationship,
});

const submitAccountNoteFail = (accountId: string, error: unknown) => ({
  type: ACCOUNT_NOTE_SUBMIT_FAIL,
  accountId,
  error,
});

export {
  submitAccountNote,
  ACCOUNT_NOTE_SUBMIT_REQUEST,
  ACCOUNT_NOTE_SUBMIT_SUCCESS,
  ACCOUNT_NOTE_SUBMIT_FAIL,
};
