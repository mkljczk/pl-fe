import { List as ImmutableList, Record as ImmutableRecord } from 'immutable';

import { MODAL_OPEN, MODAL_CLOSE, type ModalsAction } from '../actions/modals';

import type { ModalType } from 'soapbox/features/ui/components/modal-root';

const ModalRecord = ImmutableRecord({
  modalType: null as ModalType | null,
  modalProps: null as Record<string, any> | null,
});

type Modal = ReturnType<typeof ModalRecord>;
type State = ImmutableList<Modal>;

const modal = (state: State = ImmutableList<Modal>(), action: ModalsAction) => {
  switch (action.type) {
    case MODAL_OPEN:
      return state.push(ModalRecord({ modalType: action.modalType, modalProps: action.modalProps }));
    case MODAL_CLOSE:
      if (state.size === 0) {
        return state;
      }
      if (action.modalType === undefined) {
        return state.pop();
      }
      if (state.some(({ modalType }) => action.modalType === modalType)) {
        return state.slice(0, state.findLastIndex(({ modalType }) => action.modalType === modalType));
      }
      return state;
    default:
      return state;
  }
};

export { modal as default };
