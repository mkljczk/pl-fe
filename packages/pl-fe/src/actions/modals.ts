import { useModalsStore } from 'pl-fe/stores/modals';

import type { ModalType } from 'pl-fe/features/ui/components/modal-root';
import type { OpenModalProps } from 'pl-fe/stores/modals';

const openModal = (...props: OpenModalProps) => () => {
  useModalsStore.getState().openModal(...props);
};

const closeModal = (type?: ModalType) => () => {
  useModalsStore.getState().closeModal(type);
};

export {
  openModal,
  closeModal,
};
