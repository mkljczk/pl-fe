import clsx from 'clsx';
import React from 'react';

import AttachmentThumbs from 'soapbox/components/attachment-thumbs';
import Markup from 'soapbox/components/markup';
import { Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import { getTextDirection } from 'soapbox/utils/rtl';

import type { Account, Status } from 'soapbox/normalizers';

interface IReplyIndicator {
  className?: string;
  status?: Pick<Status, | 'contentHtml' | 'created_at' | 'media_attachments' | 'search_index' | 'sensitive'> & { account: Pick<Account, 'id'> };
  onCancel?: () => void;
  hideActions: boolean;
}

const ReplyIndicator: React.FC<IReplyIndicator> = ({ className, status, hideActions, onCancel }) => {
  const handleClick = () => {
    onCancel!();
  };

  if (!status) {
    return null;
  }

  let actions = {};
  if (!hideActions && onCancel) {
    actions = {
      onActionClick: handleClick,
      actionIcon: require('@tabler/icons/outline/x.svg'),
      actionAlignment: 'top',
      actionTitle: 'Dismiss',
    };
  }

  return (
    <Stack space={2} className={clsx('max-h-72 overflow-y-auto rounded-lg bg-gray-100 p-4 black:bg-gray-900 dark:bg-gray-800', className)}>
      <AccountContainer
        {...actions}
        id={status.account.id}
        timestamp={status.created_at}
        showProfileHoverCard={false}
        withLinkToProfile={false}
        hideActions={hideActions}
      />

      <Markup
        className='break-words'
        size='sm'
        dangerouslySetInnerHTML={{ __html: status.contentHtml }}
        direction={getTextDirection(status.search_index)}
      />

      {status.media_attachments.length > 0 && (
        <AttachmentThumbs
          media={status.media_attachments}
          sensitive={status.sensitive}
        />
      )}
    </Stack>
  );
};

export { ReplyIndicator as default };
