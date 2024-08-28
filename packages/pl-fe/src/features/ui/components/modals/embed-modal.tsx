import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { closeModal } from 'pl-fe/actions/modals';
import CopyableInput from 'pl-fe/components/copyable-input';
import SafeEmbed from 'pl-fe/components/safe-embed';
import { Modal, Stack, Text, Divider } from 'pl-fe/components/ui';
import { useAppDispatch } from 'pl-fe/hooks';
import useEmbed from 'pl-fe/queries/embed';

import type { BaseModalProps } from '../modal-root';

interface EmbedModalProps {
  url: string;
  onError: (error: any) => void;
}

const EmbedModal: React.FC<BaseModalProps & EmbedModalProps> = ({ url, onError }) => {
  const dispatch = useAppDispatch();
  const { data: embed, error, isError } = useEmbed(url);

  useEffect(() => {
    if (error && isError) {
      onError(error);
    }
  }, [isError]);

  const handleClose = () => {
    dispatch(closeModal('EMBED'));
  };

  return (
    <Modal
      title={<FormattedMessage id='status.embed' defaultMessage='Embed post' />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <Text theme='muted'>
          <FormattedMessage id='embed.instructions' defaultMessage='Embed this post on your website by copying the code below.' />
        </Text>

        <CopyableInput value={embed?.html || ''} />
      </Stack>

      <div className='py-9'>
        <Divider />
      </div>

      <SafeEmbed
        className='w-full overflow-hidden rounded-xl'
        sandbox='allow-same-origin allow-scripts'
        title='embedded-status'
        html={embed?.html}
      />
    </Modal>
  );
};

export { EmbedModal as default, type EmbedModalProps };
