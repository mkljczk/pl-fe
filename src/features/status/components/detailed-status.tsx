import React, { useEffect, useRef, useState } from 'react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Account from 'soapbox/components/account';
import StatusContent from 'soapbox/components/status-content';
import StatusLanguagePicker from 'soapbox/components/status-language-picker';
import StatusMedia from 'soapbox/components/status-media';
import StatusReplyMentions from 'soapbox/components/status-reply-mentions';
import SensitiveContentOverlay from 'soapbox/components/statuses/sensitive-content-overlay';
import StatusInfo from 'soapbox/components/statuses/status-info';
import TranslateButton from 'soapbox/components/translate-button';
import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';

import StatusInteractionBar from './status-interaction-bar';

import type { Status as StatusEntity } from 'soapbox/normalizers';
import type { SelectedStatus } from 'soapbox/selectors';

interface IDetailedStatus {
  status: SelectedStatus;
  withMedia?: boolean;
  onOpenCompareHistoryModal: (status: Pick<StatusEntity, 'id'>) => void;
}

const DetailedStatus: React.FC<IDetailedStatus> = ({
  status,
  onOpenCompareHistoryModal,
  withMedia = true,
}) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  const [minHeight, setMinHeight] = useState(208);

  useEffect(() => {
    if (overlay.current) {
      setMinHeight(overlay.current.getBoundingClientRect().height);
    }
  }, [overlay.current]);

  const handleOpenCompareHistoryModal = () => {
    onOpenCompareHistoryModal(status);
  };

  const renderStatusInfo = () => {
    if (status.group) {
      return (
        <div className='mb-4'>
          <StatusInfo
            avatarSize={42}
            icon={
              <Icon
                src={require('@tabler/icons/outline/circles.svg')}
                className='h-4 w-4 text-primary-600 dark:text-accent-blue'
              />
            }
            text={
              <FormattedMessage
                id='status.group'
                defaultMessage='Posted in {group}'
                values={{
                  group: (
                    <Link to={`/groups/${status.group.id}`} className='hover:underline'>
                      <bdi className='truncate'>
                        <strong className='text-gray-800 dark:text-gray-200'>
                          <span dangerouslySetInnerHTML={{ __html: status.group.display_name_html }} />
                        </strong>
                      </bdi>
                    </Link>
                  ),
                }}
              />
            }
          />
        </div>
      );
    }
  };

  const actualStatus = status?.reblog || status;
  if (!actualStatus) return null;
  const { account } = actualStatus;
  if (!account || typeof account !== 'object') return null;

  let statusTypeIcon = null;

  let quote;

  if (actualStatus.quote_id) {
    if (actualStatus.quote_visible === false) {
      quote = (
        <div className='quoted-actualStatus-tombstone'>
          <p><FormattedMessage id='status.quote_tombstone' defaultMessage='Post is unavailable.' /></p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={actualStatus.quote_id} />;
    }
  }

  if (actualStatus.visibility === 'direct') {
    statusTypeIcon = <Icon className='h-4 w-4 text-gray-700 dark:text-gray-600' src={require('@tabler/icons/outline/mail.svg')} />;
  } else if (actualStatus.visibility === 'private' || actualStatus.visibility === 'mutuals_only') {
    statusTypeIcon = <Icon className='h-4 w-4 text-gray-700 dark:text-gray-600' src={require('@tabler/icons/outline/lock.svg')} />;
  }

  return (
    <div className='border-box'>
      <div ref={node} className='detailed-actualStatus' tabIndex={-1}>
        {renderStatusInfo()}

        <div className='mb-4'>
          <Account
            key={account.id}
            account={account}
            avatarSize={42}
            hideActions
            approvalStatus={actualStatus.approval_status}
          />
        </div>

        <StatusReplyMentions status={actualStatus} />

        <Stack
          className='relative z-0'
          style={{ minHeight: actualStatus.sensitive ? Math.max(minHeight, 208) + 12 : undefined }}
        >
          <SensitiveContentOverlay
            status={status}
            ref={overlay}
          />

          <Stack space={4}>
            <StatusContent
              status={actualStatus}
              textSize='lg'
              translatable
            />

            <TranslateButton status={actualStatus} />

            {(withMedia && (quote || actualStatus.card || actualStatus.media_attachments.length > 0)) && (
              <Stack space={4}>
                <StatusMedia status={actualStatus} />

                {quote}
              </Stack>
            )}
          </Stack>
        </Stack>

        <HStack justifyContent='between' alignItems='center' className='py-3' wrap>
          <StatusInteractionBar status={actualStatus} />

          <HStack space={1} alignItems='center'>
            {statusTypeIcon}

            <span>
              <a href={actualStatus.url} target='_blank' rel='noopener' className='hover:underline'>
                <Text tag='span' theme='muted' size='sm'>
                  <FormattedDate value={new Date(actualStatus.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
                </Text>
              </a>

              {actualStatus.edited_at && (
                <>
                  {' · '}
                  <div
                    className='inline hover:underline'
                    onClick={handleOpenCompareHistoryModal}
                    role='button'
                    tabIndex={0}
                  >
                    <Text tag='span' theme='muted' size='sm'>
                      <FormattedMessage id='status.edited' defaultMessage='Edited {date}' values={{ date: intl.formatDate(new Date(actualStatus.edited_at), { hour12: true, month: 'short', day: '2-digit', hour: 'numeric', minute: '2-digit' }) }} />
                    </Text>
                  </div>
                </>
              )}
            </span>

            <StatusLanguagePicker status={status} showLabel />
          </HStack>

        </HStack>
      </div>
    </div>
  );
};

export { DetailedStatus as default };
