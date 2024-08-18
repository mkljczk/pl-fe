import React from 'react';

import { Modal } from 'soapbox/components/ui';

import type { ModalType } from '../modal-root';

interface IComponentModal {
  onClose: (type?: ModalType) => void;
  component: React.ComponentType<{
    onClose: (type?: ModalType) => void;
  }>;
  componentProps: Record<any, any>;
}

const ComponentModal: React.FC<IComponentModal> = ({ onClose, component: Component, componentProps = {} }) => (
  <Modal onClose={onClose} title=''>
    <Component onClose={onClose} {...componentProps} />
  </Modal>
);

export { ComponentModal as default };
