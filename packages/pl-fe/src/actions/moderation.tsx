import React from 'react';
import { IntlShape, defineMessages } from 'react-intl';

import { fetchAccountByUsername } from 'pl-fe/actions/accounts';
import {
  deactivateUser,
  deleteStatus,
  deleteUser,
  toggleStatusSensitivity,
} from 'pl-fe/actions/admin';
import OutlineBox from 'pl-fe/components/outline-box';
import { Stack, Text } from 'pl-fe/components/ui';
import AccountContainer from 'pl-fe/containers/account-container';
import { selectAccount } from 'pl-fe/selectors';
import { useModalsStore } from 'pl-fe/stores';
import toast from 'pl-fe/toast';

import type { AppDispatch, RootState } from 'pl-fe/store';

const messages = defineMessages({
  deactivateUserHeading: {
    id: 'confirmations.admin.deactivate_user.heading',
    defaultMessage: 'Deactivate @{acct}',
  },
  deactivateUserPrompt: {
    id: 'confirmations.admin.deactivate_user.message',
    defaultMessage:
      'You are about to deactivate @{acct}. Deactivating a user is a reversible action.',
  },
  deactivateUserConfirm: {
    id: 'confirmations.admin.deactivate_user.confirm',
    defaultMessage: 'Deactivate @{name}',
  },
  userDeactivated: {
    id: 'admin.users.user_deactivated_message',
    defaultMessage: '@{acct} was deactivated',
  },
  deleteUserHeading: {
    id: 'confirmations.admin.delete_user.heading',
    defaultMessage: 'Delete @{acct}',
  },
  deleteUserPrompt: {
    id: 'confirmations.admin.delete_user.message',
    defaultMessage:
      'You are about to delete @{acct}. THIS IS A DESTRUCTIVE ACTION THAT CANNOT BE UNDONE.',
  },
  deleteUserConfirm: {
    id: 'confirmations.admin.delete_user.confirm',
    defaultMessage: 'Delete @{name}',
  },
  deleteLocalUserCheckbox: {
    id: 'confirmations.admin.delete_local_user.checkbox',
    defaultMessage: 'I understand that I am about to delete a local user.',
  },
  userDeleted: {
    id: 'admin.users.user_deleted_message',
    defaultMessage: '@{acct} was deleted',
  },
  deleteStatusHeading: {
    id: 'confirmations.admin.delete_status.heading',
    defaultMessage: 'Delete post',
  },
  deleteStatusPrompt: {
    id: 'confirmations.admin.delete_status.message',
    defaultMessage:
      'You are about to delete a post by @{acct}. This action cannot be undone.',
  },
  deleteStatusConfirm: {
    id: 'confirmations.admin.delete_status.confirm',
    defaultMessage: 'Delete post',
  },
  rejectUserHeading: {
    id: 'confirmations.admin.reject_user.heading',
    defaultMessage: 'Reject @{acct}',
  },
  rejectUserPrompt: {
    id: 'confirmations.admin.reject_user.message',
    defaultMessage:
      'You are about to reject @{acct} registration request. This action cannot be undone.',
  },
  rejectUserConfirm: {
    id: 'confirmations.admin.reject_user.confirm',
    defaultMessage: 'Reject @{name}',
  },
  statusDeleted: {
    id: 'admin.statuses.status_deleted_message',
    defaultMessage: 'Post by @{acct} was deleted',
  },
  markStatusSensitiveHeading: {
    id: 'confirmations.admin.mark_status_sensitive.heading',
    defaultMessage: 'Mark post sensitive',
  },
  markStatusNotSensitiveHeading: {
    id: 'confirmations.admin.mark_status_not_sensitive.heading',
    defaultMessage: 'Mark post not sensitive.',
  },
  markStatusSensitivePrompt: {
    id: 'confirmations.admin.mark_status_sensitive.message',
    defaultMessage: 'You are about to mark a post by @{acct} sensitive.',
  },
  markStatusNotSensitivePrompt: {
    id: 'confirmations.admin.mark_status_not_sensitive.message',
    defaultMessage: 'You are about to mark a post by @{acct} not sensitive.',
  },
  markStatusSensitiveConfirm: {
    id: 'confirmations.admin.mark_status_sensitive.confirm',
    defaultMessage: 'Mark post sensitive',
  },
  markStatusNotSensitiveConfirm: {
    id: 'confirmations.admin.mark_status_not_sensitive.confirm',
    defaultMessage: 'Mark post not sensitive',
  },
  statusMarkedSensitive: {
    id: 'admin.statuses.status_marked_message_sensitive',
    defaultMessage: 'Post by @{acct} was marked sensitive',
  },
  statusMarkedNotSensitive: {
    id: 'admin.statuses.status_marked_message_not_sensitive',
    defaultMessage: 'Post by @{acct} was marked not sensitive',
  },
});

const deactivateUserModal =
  (intl: IntlShape, accountId: string, afterConfirm = () => {}) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const acct = selectAccount(state, accountId)!.acct;
    const name = selectAccount(state, accountId)!.username;

    const message = (
      <Stack space={4}>
        <OutlineBox>
          <AccountContainer id={accountId} hideActions />
        </OutlineBox>

        <Text>
          {intl.formatMessage(messages.deactivateUserPrompt, { acct })}
        </Text>
      </Stack>
    );

    useModalsStore.getState().openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deactivateUserHeading, { acct }),
      message,
      confirm: intl.formatMessage(messages.deactivateUserConfirm, { name }),
      onConfirm: () => {
        dispatch(deactivateUser(accountId))
          .then(() => {
            const message = intl.formatMessage(messages.userDeactivated, {
              acct,
            });
            toast.success(message);
            afterConfirm();
          })
          .catch(() => {});
      },
    });
  };

const deleteUserModal =
  (intl: IntlShape, accountId: string, afterConfirm = () => {}) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const account = selectAccount(state, accountId)!;
    const acct = account.acct;
    const name = account.username;
    const local = account.local;

    const message = (
      <Stack space={4}>
        <OutlineBox>
          <AccountContainer id={accountId} hideActions />
        </OutlineBox>

        <Text>{intl.formatMessage(messages.deleteUserPrompt, { acct })}</Text>
      </Stack>
    );

    const confirm = intl.formatMessage(messages.deleteUserConfirm, { name });
    const checkbox = local
      ? intl.formatMessage(messages.deleteLocalUserCheckbox)
      : false;

    useModalsStore.getState().openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteUserHeading, { acct }),
      message,
      confirm,
      checkbox,
      onConfirm: () => {
        dispatch(deleteUser(accountId))
          .then(() => {
            const message = intl.formatMessage(messages.userDeleted, { acct });
            dispatch(fetchAccountByUsername(acct));
            toast.success(message);
            afterConfirm();
          })
          .catch(() => {});
      },
    });
  };

const toggleStatusSensitivityModal =
  (
    intl: IntlShape,
    statusId: string,
    sensitive: boolean,
    afterConfirm = () => {},
  ) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const acct = state.statuses.get(statusId)!.account.acct;

    useModalsStore.getState().openModal('CONFIRM', {
      heading: intl.formatMessage(
        sensitive === false
          ? messages.markStatusSensitiveHeading
          : messages.markStatusNotSensitiveHeading,
      ),
      message: intl.formatMessage(
        sensitive === false
          ? messages.markStatusSensitivePrompt
          : messages.markStatusNotSensitivePrompt,
        { acct },
      ),
      confirm: intl.formatMessage(
        sensitive === false
          ? messages.markStatusSensitiveConfirm
          : messages.markStatusNotSensitiveConfirm,
      ),
      onConfirm: () => {
        dispatch(toggleStatusSensitivity(statusId, sensitive))
          .then(() => {
            const message = intl.formatMessage(
              sensitive === false
                ? messages.statusMarkedSensitive
                : messages.statusMarkedNotSensitive,
              { acct },
            );
            toast.success(message);
          })
          .catch(() => {});
        afterConfirm();
      },
    });
  };

const deleteStatusModal =
  (intl: IntlShape, statusId: string, afterConfirm = () => {}) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const acct = state.statuses.get(statusId)!.account.acct;

    useModalsStore.getState().openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteStatusHeading),
      message: intl.formatMessage(messages.deleteStatusPrompt, {
        acct: <strong className='break-words'>{acct}</strong>,
      }),
      confirm: intl.formatMessage(messages.deleteStatusConfirm),
      onConfirm: () => {
        dispatch(deleteStatus(statusId))
          .then(() => {
            const message = intl.formatMessage(messages.statusDeleted, {
              acct,
            });
            toast.success(message);
          })
          .catch(() => {});
        afterConfirm();
      },
    });
  };

export {
  deactivateUserModal,
  deleteUserModal,
  toggleStatusSensitivityModal,
  deleteStatusModal,
};
