import React, { Suspense } from 'react';

import Base from 'soapbox/components/modal-root';
import {
  AccountModerationModal,
  ActionsModal,
  BirthdaysModal,
  BoostModal,
  CompareHistoryModal,
  ComponentModal,
  ComposeEventModal,
  ComposeModal,
  ConfirmationModal,
  CryptoDonateModal,
  DislikesModal,
  EditAnnouncementModal,
  EditBookmarkFolderModal,
  EditDomainModal,
  EditFederationModal,
  EditRuleModal,
  EmbedModal,
  EventMapModal,
  EventParticipantsModal,
  FamiliarFollowersModal,
  FavouritesModal,
  HotkeysModal,
  JoinEventModal,
  LandingPageModal,
  ListAdder,
  ListEditor,
  CreateGroupModal,
  MediaModal,
  MentionsModal,
  MissingDescriptionModal,
  MuteModal,
  ReactionsModal,
  ReblogsModal,
  ReplyMentionsModal,
  ReportModal,
  SelectBookmarkFolderModal,
  TextFieldModal,
  UnauthorizedModal,
  VideoModal,
} from 'soapbox/features/ui/util/async-components';

import ModalLoading from './modal-loading';

/* eslint sort-keys: "error" */
const MODAL_COMPONENTS = {
  'ACCOUNT_MODERATION': AccountModerationModal,
  'ACTIONS': ActionsModal,
  'BIRTHDAYS': BirthdaysModal,
  'BOOST': BoostModal,
  'COMPARE_HISTORY': CompareHistoryModal,
  'COMPONENT': ComponentModal,
  'COMPOSE': ComposeModal,
  'COMPOSE_EVENT': ComposeEventModal,
  'CONFIRM': ConfirmationModal,
  'CREATE_GROUP': CreateGroupModal,
  'CRYPTO_DONATE': CryptoDonateModal,
  'DISLIKES': DislikesModal,
  'EDIT_ANNOUNCEMENT': EditAnnouncementModal,
  'EDIT_BOOKMARK_FOLDER': EditBookmarkFolderModal,
  'EDIT_DOMAIN': EditDomainModal,
  'EDIT_FEDERATION': EditFederationModal,
  'EDIT_RULE': EditRuleModal,
  'EMBED': EmbedModal,
  'EVENT_MAP': EventMapModal,
  'EVENT_PARTICIPANTS': EventParticipantsModal,
  'FAMILIAR_FOLLOWERS': FamiliarFollowersModal,
  'FAVOURITES': FavouritesModal,
  'HOTKEYS': HotkeysModal,
  'JOIN_EVENT': JoinEventModal,
  'LANDING_PAGE': LandingPageModal,
  'LIST_ADDER': ListAdder,
  'LIST_EDITOR': ListEditor,
  'MEDIA': MediaModal,
  'MENTIONS': MentionsModal,
  'MISSING_DESCRIPTION': MissingDescriptionModal,
  'MUTE': MuteModal,
  'REACTIONS': ReactionsModal,
  'REBLOGS': ReblogsModal,
  'REPLY_MENTIONS': ReplyMentionsModal,
  'REPORT': ReportModal,
  'SELECT_BOOKMARK_FOLDER': SelectBookmarkFolderModal,
  'TEXT_FIELD': TextFieldModal,
  'UNAUTHORIZED': UnauthorizedModal,
  'VIDEO': VideoModal,
};

type ModalType = keyof typeof MODAL_COMPONENTS | null;

interface IModalRoot {
  type: ModalType;
  props?: Record<string, any> | null;
  onClose: (type?: ModalType) => void;
}

const ModalRoot: React.FC<IModalRoot> = ({ onClose, props, type }) => {
  const renderLoading = (modalId: string) => !['MEDIA', 'VIDEO', 'BOOST', 'CONFIRM', 'ACTIONS'].includes(modalId) ? <ModalLoading /> : null;

  const onClickClose = (_?: ModalType) => {
    onClose(type);
  };

  const Component = type ? (MODAL_COMPONENTS as Record<keyof typeof MODAL_COMPONENTS, React.LazyExoticComponent<any>>)[type] : null;

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

export { type ModalType, ModalRoot as default };
