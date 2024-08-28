import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchFavourites, expandFavourites } from 'pl-fe/actions/interactions';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Modal, Spinner } from 'pl-fe/components/ui';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import type { BaseModalProps } from '../modal-root';

interface FavouritesModalProps {
  statusId: string;
}

const FavouritesModal: React.FC<BaseModalProps & FavouritesModalProps> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const accountIds = useAppSelector((state) => state.user_lists.favourited_by.get(statusId)?.items);
  const next = useAppSelector((state) => state.user_lists.favourited_by.get(statusId)?.next);

  const fetchData = () => {
    dispatch(fetchFavourites(statusId));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onClickClose = () => {
    onClose('FAVOURITES');
  };

  const handleLoadMore = () => {
    if (next) {
      dispatch(expandFavourites(statusId, next!));
    }
  };

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='empty_column.favourites' defaultMessage='No one has liked this post yet. When someone does, they will show up here.' />;

    body = (
      <ScrollableList
        scrollKey='favourites'
        emptyMessage={emptyMessage}
        listClassName='max-w-full'
        itemClassName='pb-3'
        style={{ height: '80vh' }}
        useWindowScroll={false}
        onLoadMore={handleLoadMore}
        hasMore={!!next}
      >
        {accountIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.favourites' defaultMessage='Likes' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { FavouritesModal as default, type FavouritesModalProps };
