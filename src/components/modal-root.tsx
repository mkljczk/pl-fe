import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'wicg-inert';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { cancelReplyCompose } from 'soapbox/actions/compose';
import { saveDraftStatus } from 'soapbox/actions/draft-statuses';
import { cancelEventCompose } from 'soapbox/actions/events';
import { openModal, closeModal } from 'soapbox/actions/modals';
import { useAppDispatch, useAppSelector, usePrevious } from 'soapbox/hooks';
import { userTouching } from 'soapbox/is-mobile';

import type { ModalType } from 'soapbox/features/ui/components/modal-root';
import type { ReducerCompose } from 'soapbox/reducers/compose';
import type { ReducerRecord as ReducerComposeEvent } from 'soapbox/reducers/compose-event';

const messages = defineMessages({
  confirm: { id: 'confirmations.cancel.confirm', defaultMessage: 'Discard' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
  saveDraft: { id: 'confirmations.cancel_editing.save_draft', defaultMessage: 'Save draft' },
});

const checkComposeContent = (compose?: ReturnType<typeof ReducerCompose>) =>
  !!compose && [
    compose.editorState && compose.editorState.length > 0,
    compose.spoiler_text.length > 0,
    compose.media_attachments.size > 0,
    compose.poll !== null,
  ].some(check => check === true);

const checkEventComposeContent = (compose?: ReturnType<typeof ReducerComposeEvent>) =>
  !!compose && [
    compose.name.length > 0,
    compose.status.length > 0,
    compose.location !== null,
    compose.banner !== null,
  ].some(check => check === true);

interface IModalRoot {
  onCancel?: () => void;
  onClose: (type?: ModalType) => void;
  type: ModalType;
  children: React.ReactNode;
}

const ModalRoot: React.FC<IModalRoot> = ({ children, onCancel, onClose, type }) => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [revealed, setRevealed] = useState(!!children);
  const isDropdownOpen = useAppSelector(state => state.dropdown_menu.isOpen);
  const wasDropdownOpen = usePrevious(isDropdownOpen);

  const ref = useRef<HTMLDivElement>(null);
  const activeElement = useRef<HTMLDivElement | null>(revealed ? document.activeElement as HTMLDivElement | null : null);
  const modalHistoryKey = useRef<number>();
  const unlistenHistory = useRef<ReturnType<typeof history.listen>>();

  const prevChildren = usePrevious(children);

  const visible = !!children;

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      handleOnClose();
    }
  };

  const handleOnClose = () => {
    dispatch((_, getState) => {
      const compose = getState().compose.get('compose-modal');
      const hasComposeContent = checkComposeContent(compose);
      const hasEventComposeContent = checkEventComposeContent(getState().compose_event);

      if (hasComposeContent && type === 'COMPOSE') {
        const isEditing = compose!.id !== null;
        dispatch(openModal('CONFIRM', {
          icon: require('@tabler/icons/outline/trash.svg'),
          heading: isEditing
            ? <FormattedMessage id='confirmations.cancel_editing.heading' defaultMessage='Cancel post editing' />
            : <FormattedMessage id='confirmations.cancel.heading' defaultMessage='Discard post' />,
          message: isEditing
            ? <FormattedMessage id='confirmations.cancel_editing.message' defaultMessage='Are you sure you want to cancel editing this post? All changes will be lost.' />
            : <FormattedMessage id='confirmations.cancel.message' defaultMessage='Are you sure you want to cancel creating this post?' />,
          confirm: intl.formatMessage(messages.confirm),
          onConfirm: () => {
            dispatch(closeModal('COMPOSE'));
            dispatch(cancelReplyCompose());
          },
          onCancel: () => {
            dispatch(closeModal('CONFIRM'));
          },
          secondary: intl.formatMessage(messages.saveDraft),
          onSecondary: isEditing ? undefined : () => {
            dispatch(saveDraftStatus('compose-modal'));
            dispatch(closeModal('COMPOSE'));
            dispatch(cancelReplyCompose());
          },
        }));
      } else if (hasEventComposeContent && type === 'COMPOSE_EVENT') {
        const isEditing = getState().compose_event.id !== null;
        dispatch(openModal('CONFIRM', {
          icon: require('@tabler/icons/outline/trash.svg'),
          heading: isEditing
            ? <FormattedMessage id='confirmations.cancel_event_editing.heading' defaultMessage='Cancel event editing' />
            : <FormattedMessage id='confirmations.delete_event.heading' defaultMessage='Delete event' />,
          message: isEditing
            ? <FormattedMessage id='confirmations.cancel_event_editing.message' defaultMessage='Are you sure you want to cancel editing this event? All changes will be lost.' />
            : <FormattedMessage id='confirmations.delete_event.message' defaultMessage='Are you sure you want to delete this event?' />,
          confirm: intl.formatMessage(isEditing ? messages.cancelEditing : messages.confirm),
          onConfirm: () => {
            dispatch(closeModal('COMPOSE_EVENT'));
            dispatch(cancelEventCompose());
          },
          onCancel: () => {
            dispatch(closeModal('CONFIRM'));
          },
        }));
      } else if ((hasComposeContent || hasEventComposeContent) && type === 'CONFIRM') {
        dispatch(closeModal('CONFIRM'));
      } else {
        onClose();
      }
    });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(ref.current!.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((x) => window.getComputedStyle(x).display !== 'none');
      const index = focusable.indexOf(e.target as Element);

      let element;

      if (e.shiftKey) {
        element = focusable[index - 1] || focusable[focusable.length - 1];
      } else {
        element = focusable[index + 1] || focusable[0];
      }

      if (element) {
        (element as HTMLDivElement).focus();
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }, []);

  const handleModalOpen = () => {
    modalHistoryKey.current = Date.now();
    unlistenHistory.current = history.listen(({ state }, action) => {
      if ((state as any)?.soapboxDropdownKey) {
        return;
      } else if (!(state as any)?.soapboxModalKey) {
        onClose();
      } else if (action === 'POP') {
        handleOnClose();

        if (onCancel) onCancel();
      }
    });
  };

  const handleModalClose = () => {
    if (unlistenHistory.current) {
      unlistenHistory.current();
    }
    const { state } = history.location;
    if (state && (state as any).soapboxModalKey === modalHistoryKey.current) {
      history.goBack();
    }
  };

  const ensureHistoryBuffer = () => {
    const { pathname, state } = history.location;
    if (!state || (state as any).soapboxModalKey !== modalHistoryKey.current) {
      history.push(pathname, { ...(state as any), soapboxModalKey: modalHistoryKey.current });
    }
  };

  const getSiblings = () => Array(...(ref.current!.parentElement!.childNodes as any as ChildNode[]))
    .filter(node => (node as HTMLDivElement).id !== 'toaster')
    .filter(node => node !== ref.current);

  useEffect(() => {
    if (!visible) return;

    window.addEventListener('keyup', handleKeyUp, false);
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  useEffect(() => {
    if (!!children && !prevChildren) {
      activeElement.current = document.activeElement as HTMLDivElement;
      getSiblings().forEach(sibling => (sibling as HTMLDivElement).setAttribute('inert', 'true'));

      handleModalOpen();
    } else if (!prevChildren) {
      setRevealed(false);
    }

    if (!children && !!prevChildren) {
      activeElement.current?.focus();
      activeElement.current = null;
      getSiblings().forEach(sibling => (sibling as HTMLDivElement).removeAttribute('inert'));

      handleModalClose();
    }

    if (children) {
      requestAnimationFrame(() => {
        setRevealed(true);
      });

      ensureHistoryBuffer();
    }
  }, [children]);

  useEffect(() => {
    if (!userTouching.matches) return;

    if (isDropdownOpen && unlistenHistory.current) {
      unlistenHistory.current();
    } else if (!isDropdownOpen && wasDropdownOpen) {
      // TODO find a better solution
      setTimeout(() => handleModalOpen(), 100);
    }
  }, [isDropdownOpen]);

  if (!visible) {
    return (
      <div className='z-50 transition-all' ref={ref} style={{ opacity: 0 }} />
    );
  }

  return (
    <div
      ref={ref}
      className={clsx('fixed left-0 top-0 z-[100] h-full w-full overflow-y-auto overflow-x-hidden transition-opacity ease-in-out', {
        'pointer-events-none': !visible,
      })}
      style={{ opacity: revealed ? 1 : 0 }}
    >
      <div
        role='presentation'
        id='modal-overlay'
        className='fixed inset-0 bg-gray-500/90 backdrop-blur black:bg-gray-900/90 dark:bg-gray-700/90'
        onClick={handleOnClose}
      />

      <div
        role='dialog'
        className={clsx({
          'my-2 mx-auto relative pointer-events-none flex items-center min-h-[calc(100%-3.5rem)]': true,
          'p-4 md:p-0': type !== 'MEDIA',
          '!my-0': type === 'MEDIA',
        })}
      >
        {children}
      </div>
    </div>
  );
};

export {
  checkComposeContent,
  checkEventComposeContent,
  ModalRoot as default,
};
