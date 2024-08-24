import clsx from 'clsx';
import React, { MouseEventHandler } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import StatusMedia from 'soapbox/components/status-media';
import { Stack } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';

import EventPreview from './event-preview';
import OutlineBox from './outline-box';
import QuotedStatusIndicator from './quoted-status-indicator';
import StatusContent from './status-content';
import StatusReplyMentions from './status-reply-mentions';
import SensitiveContentOverlay from './statuses/sensitive-content-overlay';

import type { SelectedStatus } from 'soapbox/selectors';

const messages = defineMessages({
  cancel: { id: 'reply_indicator.cancel', defaultMessage: 'Cancel' },
});

interface IQuotedStatus {
  /** The quoted status entity. */
  status?: SelectedStatus;
  /** Callback when cancelled (during compose). */
  onCancel?: Function;
  /** Whether the status is shown in the post composer. */
  compose?: boolean;
}

/** Status embedded in a quote post. */
const QuotedStatus: React.FC<IQuotedStatus> = ({ status, onCancel, compose }) => {
  const intl = useIntl();
  const history = useHistory();

  const handleExpandClick: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!status) return;
    const account = status.account;

    if (!compose && e.button === 0) {
      const statusUrl = `/@${account.acct}/posts/${status.id}`;
      if (!(e.ctrlKey || e.metaKey)) {
        history.push(statusUrl);
      } else {
        window.open(statusUrl, '_blank');
      }
      e.stopPropagation();
      e.preventDefault();
    }
  };

  const handleClose = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (!status) {
    return null;
  }

  const account = status.account;

  let actions = {};
  if (onCancel) {
    actions = {
      onActionClick: handleClose,
      actionIcon: require('@tabler/icons/outline/x.svg'),
      actionAlignment: 'top',
      actionTitle: intl.formatMessage(messages.cancel),
    };
  }

  return (
    <OutlineBox
      data-testid='quoted-status'
      className={clsx('cursor-pointer', {
        'hover:bg-gray-100 dark:hover:bg-gray-800': !compose,
      })}
    >
      <Stack
        space={2}
        onClick={handleExpandClick}
      >
        <AccountContainer
          {...actions}
          id={account.id}
          timestamp={status.created_at}
          withRelationship={false}
          showProfileHoverCard={!compose}
          withLinkToProfile={!compose}
        />

        <StatusReplyMentions status={status} hoverable={false} />

        {status.event ? <EventPreview status={status} hideAction /> : (
          <Stack className='relative z-0'>
            <Stack space={4}>
              <StatusContent
                status={status}
                collapsable
              />

              {status.quote_id && <QuotedStatusIndicator statusId={status.quote_id} />}

              <div className='relative'>
                <SensitiveContentOverlay status={status} />
                {status.media_attachments.length > 0 && (
                  <StatusMedia status={status} muted={compose} />
                )}
              </div>
            </Stack>
          </Stack>
        )}
      </Stack>
    </OutlineBox>
  );
};

export { QuotedStatus as default };
