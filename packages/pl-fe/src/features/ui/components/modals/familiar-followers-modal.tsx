import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import ScrollableList from 'pl-fe/components/scrollable-list';
import { Modal, Spinner } from 'pl-fe/components/ui';
import AccountContainer from 'pl-fe/containers/account-container';
import { useAppSelector } from 'pl-fe/hooks';
import { makeGetAccount } from 'pl-fe/selectors';

import type { BaseModalProps } from '../modal-root';

const getAccount = makeGetAccount();

interface FamiliarFollowersModalProps {
  accountId: string;
}

const FamiliarFollowersModal: React.FC<BaseModalProps & FamiliarFollowersModalProps> = ({ accountId, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const account = useAppSelector(state => getAccount(state, accountId));
  const familiarFollowerIds = useAppSelector(state => state.user_lists.familiar_followers.get(accountId)?.items || []);

  const onClickClose = () => {
    onClose('FAMILIAR_FOLLOWERS');
  };

  let body;

  if (!account || !familiarFollowerIds) {
    body = <Spinner />;
  } else {
    const emptyMessage = <FormattedMessage id='account.familiar_followers.empty' defaultMessage='No one you know follows {name}.' values={{ name: <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} /> }} />;

    body = (
      <ScrollableList
        emptyMessage={emptyMessage}
        itemClassName='pb-3'
        style={{ height: 'calc(80vh - 88px)' }}
        estimatedSize={42}
        useWindowScroll={false}
        parentRef={modalRef}
      >
        {familiarFollowerIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={
        <FormattedMessage
          id='column.familiar_followers'
          defaultMessage='People you know following {name}'
          values={{ name: <span dangerouslySetInnerHTML={{ __html: account?.display_name_html || '' }} /> }}
        />
      }
      onClose={onClickClose}
      ref={modalRef}
    >
      {body}
    </Modal>
  );
};

export { FamiliarFollowersModal as default, type FamiliarFollowersModalProps };
