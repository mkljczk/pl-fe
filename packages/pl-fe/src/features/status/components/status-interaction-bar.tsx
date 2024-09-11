import clsx from 'clsx';import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { openModal } from 'pl-fe/actions/modals';
import AnimatedNumber from 'pl-fe/components/animated-number';
import { HStack, Text } from 'pl-fe/components/ui';
import { useAppSelector, useFeatures, useAppDispatch } from 'pl-fe/hooks';

import type { Status } from 'pl-fe/normalizers';

interface IStatusInteractionBar {
  status: Pick<Status, 'id' | 'account' | 'dislikes_count' | 'favourited' | 'favourites_count' | 'reblogs_count' | 'quotes_count'>;
}

const StatusInteractionBar: React.FC<IStatusInteractionBar> = ({ status }): JSX.Element | null => {
  const me = useAppSelector(({ me }) => me);
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { account } = status;

  if (!account || typeof account !== 'object') return null;

  const onOpenUnauthorizedModal = () => {
    dispatch(openModal('UNAUTHORIZED'));
  };

  const onOpenReblogsModal = (username: string, statusId: string): void => {
    dispatch(openModal('REBLOGS', { statusId }));
  };

  const onOpenFavouritesModal = (username: string, statusId: string): void => {
    dispatch(openModal('FAVOURITES', { statusId }));
  };

  const onOpenDislikesModal = (username: string, statusId: string): void => {
    dispatch(openModal('DISLIKES', { statusId }));
  };

  const handleOpenReblogsModal: React.EventHandler<React.MouseEvent> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenReblogsModal(account.acct, status.id);
  };

  const getReposts = () => {
    if (status.reblogs_count) {
      return (
        <InteractionCounter count={status.reblogs_count} onClick={handleOpenReblogsModal}>
          <FormattedMessage
            id='status.interactions.reblogs'
            defaultMessage='{count, plural, one {Repost} other {Reposts}}'
            values={{ count: status.reblogs_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const getQuotes = () => {
    if (status.quotes_count) {
      return (
        <InteractionCounter count={status.quotes_count} to={`/@${status.account.acct}/posts/${status.id}/quotes`}>
          <FormattedMessage
            id='status.interactions.quotes'
            defaultMessage='{count, plural, one {Quote} other {Quotes}}'
            values={{ count: status.quotes_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const handleOpenFavouritesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenFavouritesModal(account.acct, status.id);
  };

  const handleOpenDislikesModal: React.EventHandler<React.MouseEvent<HTMLButtonElement>> = (e) => {
    e.preventDefault();

    if (!me) onOpenUnauthorizedModal();
    else onOpenDislikesModal(account.acct, status.id);
  };

  const getFavourites = () => {
    if (status.favourites_count) {
      return (
        <InteractionCounter count={status.favourites_count} onClick={features.exposableReactions ? handleOpenFavouritesModal : undefined}>
          <FormattedMessage
            id='status.interactions.favourites'
            defaultMessage='{count, plural, one {Like} other {Likes}}'
            values={{ count: status.favourites_count }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  const getDislikes = () => {
    const dislikesCount = status.dislikes_count;

    if (dislikesCount) {
      return (
        <InteractionCounter count={status.dislikes_count} onClick={features.exposableReactions ? handleOpenDislikesModal : undefined}>
          <FormattedMessage
            id='status.interactions.dislikes'
            defaultMessage='{count, plural, one {Dislike} other {Dislikes}}'
            values={{ count: dislikesCount }}
          />
        </InteractionCounter>
      );
    }

    return null;
  };

  return (
    <HStack space={3}>
      {getReposts()}
      {getQuotes()}
      {getFavourites()}
      {getDislikes()}
    </HStack>
  );
};

interface IInteractionCounter {
  count: number;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  to?: string;
}

const InteractionCounter: React.FC<IInteractionCounter> = ({ count, children, onClick, to }) => {
  const features = useFeatures();

  const className = clsx({
    'text-gray-600 dark:text-gray-700': true,
    'hover:underline': features.exposableReactions,
    'cursor-default': !features.exposableReactions,
  });

  const body = (
    <HStack space={1} alignItems='center'>
      <Text weight='bold'>
        <AnimatedNumber value={count} short />
      </Text>

      <Text tag='div' theme='muted'>
        {children}
      </Text>
    </HStack>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className={className}
    >
      {body}
    </button>
  );
};

export { StatusInteractionBar as default };
