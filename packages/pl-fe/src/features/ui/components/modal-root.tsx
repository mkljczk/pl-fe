import React, { Suspense, lazy } from 'react';

import { cancelReplyCompose } from 'pl-fe/actions/compose';
import { cancelEventCompose } from 'pl-fe/actions/events';
import { closeModal } from 'pl-fe/actions/modals';
import { cancelReport } from 'pl-fe/actions/reports';
import Base from 'pl-fe/components/modal-root';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import ModalLoading from './modal-loading';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS = {
  ACCOUNT_MODERATION: lazy(() => import(/* webpackChunkName: "admin" */ 'pl-fe/features/ui/components/modals/account-moderation-modal')),
  BIRTHDAYS: lazy(() => import(/* webpackChunkName: "accounts" */ 'pl-fe/features/ui/components/modals/birthdays-modal')),
  BOOST: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/boost-modal')),
  COMPARE_HISTORY: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/compare-history-modal')),
  COMPONENT: lazy(() => import(/* webpackChunkName: "ui" */ 'pl-fe/features/ui/components/modals/component-modal')),
  COMPOSE: lazy(() => import(/* webpackChunkName: "compose" */ 'pl-fe/features/ui/components/modals/compose-modal')),
  COMPOSE_EVENT: lazy(() => import(/* webpackChunkName: "compose" */ 'pl-fe/features/ui/components/modals/compose-event-modal')),
  CONFIRM: lazy(() => import(/* webpackChunkName: "ui" */ 'pl-fe/features/ui/components/modals/confirmation-modal')),
  CREATE_GROUP: lazy(() => import(/* webpackChunkName: "groups" */ 'pl-fe/features/ui/components/modals/manage-group-modal')),
  CRYPTO_DONATE: lazy(() => import('pl-fe/features/ui/components/modals/crypto-donate-modal')),
  DISLIKES: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/dislikes-modal')),
  DROPDOWN_MENU: lazy(() => import(/* webpackChunkName: "ui" */ 'pl-fe/features/ui/components/modals/dropdown-menu-modal')),
  EDIT_ANNOUNCEMENT: lazy(() => import(/* webpackChunkName: "admin" */ 'pl-fe/features/ui/components/modals/edit-announcement-modal')),
  EDIT_BOOKMARK_FOLDER: lazy(() => import(/* webpackChunkName: "bookmarks" */ 'pl-fe/features/ui/components/modals/edit-bookmark-folder-modal')),
  EDIT_DOMAIN: lazy(() => import(/* webpackChunkName: "admin" */ 'pl-fe/features/ui/components/modals/edit-domain-modal')),
  EDIT_FEDERATION: lazy(() => import(/* webpackChunkName: "admin" */ 'pl-fe/features/ui/components/modals/edit-federation-modal')),
  EDIT_RULE: lazy(() => import(/* webpackChunkName: "admin" */ 'pl-fe/features/ui/components/modals/edit-rule-modal')),
  EMBED: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/embed-modal')),
  EVENT_MAP: lazy(() => import(/* webpackChunkName: "events" */ 'pl-fe/features/ui/components/modals/event-map-modal')),
  EVENT_PARTICIPANTS: lazy(() => import(/* webpackChunkName: "events" */ 'pl-fe/features/ui/components/modals/event-participants-modal')),
  FAMILIAR_FOLLOWERS: lazy(() => import(/* webpackChunkName: "accounts" */ 'pl-fe/features/ui/components/modals/familiar-followers-modal')),
  FAVOURITES: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/favourites-modal')),
  HOTKEYS: lazy(() => import(/* webpackChunkName: "ui" */ 'pl-fe/features/ui/components/modals/hotkeys-modal')),
  JOIN_EVENT: lazy(() => import(/* webpackChunkName: "events" */ 'pl-fe/features/ui/components/modals/join-event-modal')),
  LIST_ADDER: lazy(() => import(/* webpackChunkName: "lists" */ 'pl-fe/features/ui/components/modals/list-adder-modal')),
  LIST_EDITOR: lazy(() => import(/* webpackChunkName: "lists" */ 'pl-fe/features/ui/components/modals/list-editor-modal')),
  MEDIA: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/media-modal')),
  MENTIONS: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/mentions-modal')),
  MISSING_DESCRIPTION: lazy(() => import(/* webpackChunkName: "compose" */ 'pl-fe/features/ui/components/modals/missing-description-modal')),
  MUTE: lazy(() => import(/* webpackChunkName: "accounts" */ 'pl-fe/features/ui/components/modals/mute-modal')),
  REACTIONS: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/reactions-modal')),
  REBLOGS: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/reblogs-modal')),
  REPLY_MENTIONS: lazy(() => import(/* webpackChunkName: "compose" */ 'pl-fe/features/ui/components/modals/reply-mentions-modal')),
  REPORT: lazy(() => import(/* webpackChunkName: "accounts" */ 'pl-fe/features/ui/components/modals/report-modal')),
  SELECT_BOOKMARK_FOLDER: lazy(() => import(/* webpackChunkName: "bookmarks" */ 'pl-fe/features/ui/components/modals/select-bookmark-folder-modal')),
  TEXT_FIELD: lazy(() => import(/* webpackChunkName: "ui" */ 'pl-fe/features/ui/components/modals/text-field-modal')),
  UNAUTHORIZED: lazy(() => import(/* webpackChunkName: "auth" */ 'pl-fe/features/ui/components/modals/unauthorized-modal')),
  VIDEO: lazy(() => import(/* webpackChunkName: "statuses" */ 'pl-fe/features/ui/components/modals/video-modal')),
};

type ModalType = keyof typeof MODAL_COMPONENTS | null;

type BaseModalProps = {
  /** Action to close the modal. */
  onClose(type?: ModalType): void;
};

const ModalRoot: React.FC = () => {
  const renderLoading = (modalId: string) => !['MEDIA', 'VIDEO', 'BOOST', 'CONFIRM'].includes(modalId) ? <ModalLoading /> : null;

  const dispatch = useAppDispatch();
  const { modalType: type, modalProps: props } = useAppSelector((state) => state.modals.last({
    modalProps: {},
    modalType: null,
  }));

  const onClickClose = (type?: ModalType) => {
    switch (type) {
      case 'COMPOSE':
        dispatch(cancelReplyCompose());
        break;
      case 'COMPOSE_EVENT':
        dispatch(cancelEventCompose());
        break;
      case 'REPORT':
        dispatch(cancelReport());
        break;
      default:
        break;
    }

    dispatch(closeModal(type));
  };

  const Component = type !== null ? (MODAL_COMPONENTS as Record<keyof typeof MODAL_COMPONENTS, React.LazyExoticComponent<any>>)[type] : null;

  return (
    <Base onClose={onClickClose} type={type}>
      {(Component && !!type) && (
        <Suspense fallback={renderLoading(type)}>
          <Component {...props} onClose={onClickClose} />
        </Suspense>
      )}
    </Base>
  );
};

export { type BaseModalProps, type ModalType, ModalRoot as default };
