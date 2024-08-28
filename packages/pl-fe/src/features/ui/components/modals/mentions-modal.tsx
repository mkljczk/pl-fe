import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useCallback, useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { fetchStatusWithContext } from 'soapbox/actions/statuses';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Modal, Spinner } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import type { BaseModalProps } from '../modal-root';

interface MentionsModalProps {
  statusId: string;
}

const MentionsModal: React.FC<BaseModalProps & MentionsModalProps> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector((state) => getStatus(state, { id: statusId }));
  const accountIds = status ? ImmutableOrderedSet(status.mentions.map(m => m.id)) : null;

  const fetchData = () => {
    dispatch(fetchStatusWithContext(statusId, intl));
  };

  const onClickClose = () => {
    onClose('MENTIONS');
  };

  useEffect(() => {
    fetchData();
  }, []);

  let body;

  if (!accountIds) {
    body = <Spinner />;
  } else {
    body = (
      <ScrollableList
        scrollKey='mentions'
        listClassName='max-w-full'
        itemClassName='pb-3'
      >
        {accountIds.map(id =>
          <AccountContainer key={id} id={id} />,
        )}
      </ScrollableList>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='column.mentions' defaultMessage='Mentions' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { MentionsModal as default, type MentionsModalProps };
