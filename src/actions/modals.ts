import { AppDispatch } from 'soapbox/store';

import type { MediaAttachment } from 'pl-api';
import type { ModalType } from 'soapbox/features/ui/components/modal-root';

const MODAL_OPEN = 'MODAL_OPEN';
const MODAL_CLOSE = 'MODAL_CLOSE';

type OpenModalProps =
  | [type: 'MEDIA', props: {
    media: Array<MediaAttachment>;
    statusId?: string;
    index: number;
    time?: number;
  }]
  | [type: Exclude<ModalType, 'MEDIA'>, props: any]
  | [type: Exclude<ModalType, 'MEDIA'>];

/** Open a modal of the given type */
const openModal = (...[type, props]: OpenModalProps) => {
  // const [type, props] = args;
  return (dispatch: AppDispatch) => {
    dispatch(closeModal(type));
    dispatch(openModalSuccess(type, props));
  };
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
