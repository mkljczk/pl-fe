import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal, Stack, Textarea } from 'soapbox/components/ui';

import type { ButtonThemes } from 'soapbox/components/ui/button/useButtonStyles';

interface ITextFieldModal {
  heading: React.ReactNode;
  placeholder?: string;
  confirm: React.ReactNode;
  onClose: (type: string) => void;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
  confirmationTheme?: ButtonThemes;
  text?: string;
}

const TextFieldModal: React.FC<ITextFieldModal> = ({
  heading,
  placeholder,
  confirm,
  onClose,
  onConfirm,
  onCancel,
  confirmationTheme,
  text,
}) => {
  const [value, setValue] = useState(text);

  const handleClick = () => {
    onClose('CONFIRM');
    onConfirm(value);
  };

  const handleCancel = () => {
    onClose('CONFIRM');
    if (onCancel) onCancel();
  };

  return (
    <Modal
      title={heading}
      confirmationAction={handleClick}
      confirmationText={confirm}
      confirmationTheme={confirmationTheme}
      cancelText={<FormattedMessage id='confirmation_modal.cancel' defaultMessage='Cancel' />}
      cancelAction={handleCancel}
    >
      <Stack space={4}>
        <Textarea
          value={value}
          onChange={({ target }) => setValue(target.value)}
          autoComplete='off'
          placeholder={placeholder}
        />
      </Stack>
    </Modal>
  );
};

export { TextFieldModal as default };
