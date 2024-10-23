import { useStatus } from 'pl-hooks';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import Modal from 'pl-fe/components/ui/modal';
import Account from 'pl-fe/features/reply-mentions/account';
import { useCompose } from 'pl-fe/hooks/useCompose';
import { useOwnAccount } from 'pl-fe/hooks/useOwnAccount';
import { statusToMentionsAccountIdsArray } from 'pl-fe/reducers/compose';

import type { BaseModalProps } from '../modal-root';

interface ReplyMentionsModalProps {
  composeId: string;
}

const ReplyMentionsModal: React.FC<BaseModalProps & ReplyMentionsModalProps> = ({ composeId, onClose }) => {
  const compose = useCompose(composeId);

  const { data: status } = useStatus(compose.in_reply_to!);
  const { account } = useOwnAccount();

  const mentions = statusToMentionsAccountIdsArray(status!, account!, compose.parent_reblogged_by);
  const author = status?.account_id;

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

export { ReplyMentionsModal as default, type ReplyMentionsModalProps };
