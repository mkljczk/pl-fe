import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { setComposeToStatus } from 'pl-fe/actions/compose';
import { cancelDraftStatus } from 'pl-fe/actions/draft-statuses';
import { getSettings } from 'pl-fe/actions/settings';
import { Button, HStack } from 'pl-fe/components/ui';
import { useAppDispatch } from 'pl-fe/hooks';
import { useModalsStore } from 'pl-fe/stores';

import type { Status as StatusEntity } from 'pl-fe/normalizers';
import type { DraftStatus } from 'pl-fe/reducers/draft-statuses';

const messages = defineMessages({
  deleteConfirm: {
    id: 'confirmations.draft_status_delete.confirm',
    defaultMessage: 'Discard',
  },
  deleteHeading: {
    id: 'confirmations.draft_status_delete.heading',
    defaultMessage: 'Cancel draft post',
  },
  deleteMessage: {
    id: 'confirmations.draft_status_delete.message',
    defaultMessage: 'Are you sure you want to discard this draft post?',
  },
});

interface IDraftStatusActionBar {
  source: DraftStatus;
  status: StatusEntity;
}

const DraftStatusActionBar: React.FC<IDraftStatusActionBar> = ({
  source,
  status,
}) => {
  const intl = useIntl();

  const { openModal } = useModalsStore();
  const dispatch = useAppDispatch();

  const handleCancelClick = () => {
    dispatch((_, getState) => {
      const deleteModal = getSettings(getState()).get('deleteModal');
      if (!deleteModal) {
        dispatch(cancelDraftStatus(source.draft_id));
      } else {
        openModal('CONFIRM', {
          heading: intl.formatMessage(messages.deleteHeading),
          message: intl.formatMessage(messages.deleteMessage),
          confirm: intl.formatMessage(messages.deleteConfirm),
          onConfirm: () => dispatch(cancelDraftStatus(source.draft_id)),
        });
      }
    });
  };

  const handleEditClick = () => {
    dispatch(
      setComposeToStatus(
        status,
        status.poll,
        source.text,
        source.spoiler_text,
        source.content_type,
        false,
        source.draft_id,
        source.editorState,
      ),
    );
    openModal('COMPOSE');
  };

  return (
    <HStack space={2} justifyContent='end'>
      <Button theme='primary' size='sm' onClick={handleEditClick}>
        <FormattedMessage id='draft_status.edit' defaultMessage='Edit' />
      </Button>
      <Button theme='danger' size='sm' onClick={handleCancelClick}>
        <FormattedMessage id='draft_status.cancel' defaultMessage='Delete' />
      </Button>
    </HStack>
  );
};

export { DraftStatusActionBar as default };
