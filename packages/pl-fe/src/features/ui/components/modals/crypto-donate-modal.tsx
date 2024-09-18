import React from 'react';

import { Modal } from 'pl-fe/components/ui';
import DetailedCryptoAddress from 'pl-fe/features/crypto-donate/components/detailed-crypto-address';

import { BaseModalProps } from '../modal-root';

import type { ICryptoAddress } from '../../../crypto-donate/components/crypto-address';

const CryptoDonateModal: React.FC<BaseModalProps & ICryptoAddress> = ({
  onClose,
  ...props
}) => {
  return (
    <Modal onClose={onClose} width='xs'>
      <div className='crypto-donate-modal'>
        <DetailedCryptoAddress {...props} />
      </div>
    </Modal>
  );
};

export { CryptoDonateModal as default };
