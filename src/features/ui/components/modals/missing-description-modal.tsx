import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { Modal } from 'soapbox/components/ui';

const messages = defineMessages({
  modalTitle: { id: 'missing_description_modal.text', defaultMessage: 'You have not entered a description for all attachments. Continue anyway?' },
  post: { id: 'missing_description_modal.continue', defaultMessage: 'Post' },
  cancel: { id: 'missing_description_modal.cancel', defaultMessage: 'Cancel' },
});

interface IMissingDescriptionModal {
  onClose: () => void;
  onContinue: () => void;
}

const MissingDescriptionModal: React.FC<IMissingDescriptionModal> = ({ onClose, onContinue }) => {
  const intl = useIntl();

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle)}
      confirmationAction={onContinue}
      confirmationText={intl.formatMessage(messages.post)}
      confirmationTheme='danger'
      cancelText={intl.formatMessage(messages.cancel)}
      cancelAction={onClose}
    >
      <p className='text-gray-600 dark:text-gray-300'>
        <FormattedMessage id='missing_description_modal.description' defaultMessage='Continue anyway?' />
      </p>
    </Modal>
  );
};

export { MissingDescriptionModal as default };
