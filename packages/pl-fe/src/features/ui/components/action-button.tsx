import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import {
  authorizeFollowRequest,
  biteAccount,
  blockAccount,
  muteAccount,
  rejectFollowRequest,
  unblockAccount,
  unmuteAccount,
} from 'pl-fe/actions/accounts';
import { useFollow } from 'pl-fe/api/hooks';
import { Button, HStack } from 'pl-fe/components/ui';
import { useAppDispatch, useFeatures, useLoggedIn } from 'pl-fe/hooks';
import { useModalsStore } from 'pl-fe/stores';
import toast from 'pl-fe/toast';

import type { Account } from 'pl-fe/normalizers';

const messages = defineMessages({
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  blocked: { id: 'account.blocked', defaultMessage: 'Blocked' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  follow: { id: 'account.follow', defaultMessage: 'Follow' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  remote_follow: {
    id: 'account.remote_follow',
    defaultMessage: 'Remote follow',
  },
  requested: {
    id: 'account.requested',
    defaultMessage: 'Awaiting approval. Click to cancel follow request',
  },
  requested_small: {
    id: 'account.requested_small',
    defaultMessage: 'Awaiting approval',
  },
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  unfollow: { id: 'account.unfollow', defaultMessage: 'Unfollow' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  authorize: { id: 'follow_request.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'follow_request.reject', defaultMessage: 'Reject' },
  bite: { id: 'account.bite', defaultMessage: 'Bite @{name}' },
  userBit: {
    id: 'account.bite.success',
    defaultMessage: 'You have bit @{acct}',
  },
  userBiteFail: {
    id: 'account.bite.fail',
    defaultMessage: 'Failed to bite @{acct}',
  },
});

interface IActionButton {
  /** Target account for the action. */
  account: Account;
  /** Type of action to prioritize, eg on Blocks and Mutes pages. */
  actionType?: 'muting' | 'blocking' | 'follow_request' | 'biting';
  /** Displays shorter text on the "Awaiting approval" button. */
  small?: boolean;
}

/**
 * Circumstantial action button (usually "Follow") to display on accounts.
 * May say "Unblock" or something else, depending on the relationship and
 * `actionType` prop.
 */
const ActionButton: React.FC<IActionButton> = ({
  account,
  actionType,
  small,
}) => {
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const { isLoggedIn, me } = useLoggedIn();
  const { follow, unfollow } = useFollow();

  const handleFollow = () => {
    if (account.relationship?.following || account.relationship?.requested) {
      unfollow(account.id);
    } else {
      follow(account.id);
    }
  };

  const handleBlock = () => {
    if (account.relationship?.blocking) {
      dispatch(unblockAccount(account.id));
    } else {
      dispatch(blockAccount(account.id));
    }
  };

  const handleMute = () => {
    if (account.relationship?.muting) {
      dispatch(unmuteAccount(account.id));
    } else {
      dispatch(muteAccount(account.id));
    }
  };

  const handleAuthorize = () => {
    dispatch(authorizeFollowRequest(account.id));
  };

  const handleReject = () => {
    dispatch(rejectFollowRequest(account.id));
  };

  const handleBite = () => {
    dispatch(biteAccount(account.id))
      .then(() =>
        toast.success(
          intl.formatMessage(messages.userBit, { acct: account.acct }),
        ),
      )
      .catch(() =>
        toast.error(
          intl.formatMessage(messages.userBiteFail, { acct: account.acct }),
        ),
      );
  };

  const handleRemoteFollow = () => {
    openModal('UNAUTHORIZED', {
      action: 'FOLLOW',
      account: account.id,
      ap_id: account.url,
    });
  };

  /** Handles actionType='muting' */
  const mutingAction = () => {
    const isMuted = account.relationship?.muting;
    const messageKey = isMuted ? messages.unmute : messages.mute;
    const text = intl.formatMessage(messageKey, { name: account.username });

    return (
      <Button
        theme={isMuted ? 'danger' : 'secondary'}
        size='sm'
        text={text}
        onClick={handleMute}
      />
    );
  };

  /** Handles actionType='blocking' */
  const blockingAction = () => {
    const isBlocked = account.relationship?.blocking;
    const messageKey = isBlocked ? messages.unblock : messages.block;
    const text = intl.formatMessage(messageKey, { name: account.username });

    return (
      <Button
        theme={isBlocked ? 'danger' : 'secondary'}
        size='sm'
        text={text}
        onClick={handleBlock}
      />
    );
  };

  /** Handles actionType='blocking' */
  const bitingAction = () => {
    const text = intl.formatMessage(messages.bite, { name: account.username });

    return (
      <Button
        theme='secondary'
        size='sm'
        text={text}
        onClick={handleBite}
        icon={require('@tabler/icons/outline/pacman.svg')}
      />
    );
  };

  const followRequestAction = () => {
    if (account.relationship?.followed_by) return null;

    return (
      <HStack space={2}>
        <Button
          theme='secondary'
          size='sm'
          text={intl.formatMessage(messages.authorize)}
          onClick={handleAuthorize}
        />
        <Button
          theme='danger'
          size='sm'
          text={intl.formatMessage(messages.reject)}
          onClick={handleReject}
        />
      </HStack>
    );
  };

  /** Render a remote follow button, depending on features. */
  const renderRemoteFollow = () => {
    // Remote follow through the API.
    if (features.remoteInteractions) {
      return (
        <Button
          onClick={handleRemoteFollow}
          icon={require('@tabler/icons/outline/plus.svg')}
          text={intl.formatMessage(messages.follow)}
          size='sm'
        />
      );
      // Pleroma's classic remote follow form.
    } else if (features.pleromaRemoteFollow) {
      return (
        <form method='POST' action='/main/ostatus'>
          <input type='hidden' name='nickname' value={account.acct} />
          <input type='hidden' name='profile' value='' />
          <Button
            text={intl.formatMessage(messages.remote_follow)}
            type='submit'
            size='sm'
          />
        </form>
      );
    }

    return null;
  };

  /** Render remote follow if federating, otherwise hide the button. */
  const renderLoggedOut = () => {
    if (features.federating) {
      return renderRemoteFollow();
    }

    return null;
  };

  if (!isLoggedIn) {
    return renderLoggedOut();
  }

  if (me !== account.id) {
    const isFollowing = account.relationship?.following;
    const blockedBy = account.relationship?.blocked_by as boolean;

    if (actionType) {
      if (actionType === 'muting') {
        return mutingAction();
      } else if (actionType === 'blocking') {
        return blockingAction();
      } else if (actionType === 'follow_request') {
        return followRequestAction();
      } else if (actionType === 'biting') {
        return bitingAction();
      }
    }

    if (!account.relationship) {
      // Wait until the relationship is loaded
      return null;
    } else if (account.relationship?.requested) {
      // Awaiting acceptance
      return (
        <Button
          size='sm'
          theme='tertiary'
          text={
            small
              ? intl.formatMessage(messages.requested_small)
              : intl.formatMessage(messages.requested)
          }
          onClick={handleFollow}
        />
      );
    } else if (
      !account.relationship?.blocking &&
      !account.relationship?.muting
    ) {
      // Follow & Unfollow
      return (
        <Button
          size='sm'
          disabled={blockedBy}
          theme={isFollowing ? 'secondary' : 'primary'}
          icon={
            blockedBy
              ? require('@tabler/icons/outline/ban.svg')
              : !isFollowing && require('@tabler/icons/outline/plus.svg')
          }
          onClick={handleFollow}
        >
          {isFollowing
            ? intl.formatMessage(messages.unfollow)
            : intl.formatMessage(
              blockedBy ? messages.blocked : messages.follow,
            )}
        </Button>
      );
    } else if (account.relationship?.blocking) {
      // Unblock
      return (
        <Button
          theme='danger'
          size='sm'
          text={intl.formatMessage(messages.unblock, {
            name: account.username,
          })}
          onClick={handleBlock}
        />
      );
    }
  } else {
    // Edit profile
    return (
      <Button
        theme='tertiary'
        size='sm'
        text={intl.formatMessage(messages.edit_profile)}
        to='/settings/profile'
      />
    );
  }

  return null;
};

export { ActionButton as default };
