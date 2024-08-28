import React from 'react';

import { Modal, Spinner } from 'pl-fe/components/ui';

const ModalLoading = () => (
  <Modal>
    <Spinner />
  </Modal>
);

export { ModalLoading as default };
