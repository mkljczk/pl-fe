import React, { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal } from 'soapbox/components/ui';
import { useAppSelector, useCompose, useOwnAccount } from 'soapbox/hooks';
import { statusToMentionsAccountIdsArray } from 'soapbox/reducers/compose';
import { makeGetStatus } from 'soapbox/selectors';

import Account from '../../../reply-mentions/account';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

interface IReplyMentionsModal {
  composeId: string;
  onClose: (string: string) => void;
}

const ReplyMentionsModal: React.FC<IReplyMentionsModal> = ({ composeId, onClose }) => {
  const compose = useCompose(composeId);

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector<StatusEntity | null>(state => getStatus(state, { id: compose.in_reply_to! }));
  const { account } = useOwnAccount();

  const mentions = statusToMentionsAccountIdsArray(status!, account!, compose.parent_reblogged_by);
  const author = (status?.account as AccountEntity).id;

  const onClickClose = () => {
    onClose('REPLY_MENTIONS');
  };

  return (
    <Modal
      title={<FormattedMessage id='navigation_bar.in_reply_to' defaultMessage='In reply to' />}
      onClose={onClickClose}
      closeIcon={require('@tabler/icons/outline/arrow-left.svg')}
      closePosition='left'
    >
      <div className='block min-h-[300px] flex-1 flex-row overflow-y-auto'>
        {mentions.map(accountId => <Account composeId={composeId} key={accountId} accountId={accountId} author={author === accountId} />)}
      </div>
    </Modal>
  );
};

export { ReplyMentionsModal as default };
