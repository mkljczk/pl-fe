import React, { useCallback } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { Modal, Stack, Text } from 'soapbox/components/ui';
import ReplyIndicator from 'soapbox/features/compose/components/reply-indicator';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import type { BaseModalProps } from '../modal-root';
import type { Status as StatusEntity } from 'soapbox/normalizers';

const messages = defineMessages({
  cancel_reblog: { id: 'status.cancel_reblog_private', defaultMessage: 'Un-repost' },
  reblog: { id: 'status.reblog', defaultMessage: 'Repost' },
});

interface BoostModalProps {
  statusId: string;
  onReblog: (status: Pick<StatusEntity, 'id' | 'reblogged'>) => void;
}

const BoostModal: React.FC<BaseModalProps & BoostModalProps> = ({ statusId, onReblog, onClose }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const intl = useIntl();
  const status = useAppSelector(state => getStatus(state, { id: statusId }))!;

  const handleReblog = () => {
    onReblog(status);
    onClose();
  };

  const buttonText = status.reblogged ? messages.cancel_reblog : messages.reblog;

  return (
    <Modal
      title={<FormattedMessage id='boost_modal.title' defaultMessage='Repost?' />}
      confirmationAction={handleReblog}
      confirmationText={intl.formatMessage(buttonText)}
    >
      <Stack space={4}>
        <ReplyIndicator status={status} hideActions />

        <Text>
          <FormattedMessage id='boost_modal.combo' defaultMessage='You can press {combo} to skip this next time' values={{ combo: <span>Shift + <Icon className='inline-block align-middle' src={require('@tabler/icons/outline/repeat.svg')} /></span> }} />
        </Text>
      </Stack>
    </Modal>
  );
};

export { type BoostModalProps, BoostModal as default };
