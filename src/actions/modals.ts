import { AppDispatch } from 'soapbox/store';

import type { ModalType } from 'soapbox/features/ui/components/modal-root';

const MODAL_OPEN  = 'MODAL_OPEN';
const MODAL_CLOSE = 'MODAL_CLOSE';

/** Open a modal of the given type */
const openModal = (type: ModalType, props?: any) =>
  (dispatch: AppDispatch) => {
    dispatch(closeModal(type));
    dispatch(openModalSuccess(type, props));
  };

const openModalSuccess = (type: ModalType, props?: any) => ({
  type: MODAL_OPEN,
  modalType: type,
  modalProps: props,
});

/** Close the modal */
const closeModal = (type?: ModalType) => ({
  type: MODAL_CLOSE,
  modalType: type,
});

type ModalsAction =
  ReturnType<typeof openModalSuccess>
  | ReturnType<typeof closeModal>;

export {
  MODAL_OPEN,
  MODAL_CLOSE,
  openModal,
  closeModal,
  type ModalsAction,
};
