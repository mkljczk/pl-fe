import React, { useRef } from 'react';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import Account from 'pl-fe/components/account';
import StatusContent from 'pl-fe/components/status-content';
import StatusLanguagePicker from 'pl-fe/components/status-language-picker';
import StatusMedia from 'pl-fe/components/status-media';
import StatusReactionsBar from 'pl-fe/components/status-reactions-bar';
import StatusReplyMentions from 'pl-fe/components/status-reply-mentions';
import SensitiveContentOverlay from 'pl-fe/components/statuses/sensitive-content-overlay';
import StatusInfo from 'pl-fe/components/statuses/status-info';
import TranslateButton from 'pl-fe/components/translate-button';
import { HStack, Icon, Stack, Text } from 'pl-fe/components/ui';
import QuotedStatus from 'pl-fe/features/status/containers/quoted-status-container';

import StatusInteractionBar from './status-interaction-bar';
import StatusTypeIcon from './status-type-icon';

import type { SelectedStatus } from 'pl-fe/selectors';

interface IDetailedStatus {
  status: SelectedStatus;
  withMedia?: boolean;
  onOpenCompareHistoryModal: (status: Pick<SelectedStatus, 'id'>) => void;
}

const DetailedStatus: React.FC<IDetailedStatus> = ({
  status,
  onOpenCompareHistoryModal,
  withMedia = true,
}) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement>(null);

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
                    <Link
                      to={`/groups/${status.group.id}`}
                      className='hover:underline'
                    >
                      <bdi className='truncate'>
                        <strong className='text-gray-800 dark:text-gray-200'>
                          <span
                            dangerouslySetInnerHTML={{
                              __html: status.group.display_name_html,
                            }}
                          />
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

  let quote;

  if (actualStatus.quote_id) {
    if (actualStatus.quote_visible === false) {
      quote = (
        <div className='quoted-actualStatus-tombstone'>
          <p>
            <FormattedMessage
              id='status.quote_tombstone'
              defaultMessage='Post is unavailable.'
            />
          </p>
        </div>
      );
    } else {
      quote = <QuotedStatus statusId={actualStatus.quote_id} />;
    }
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

        <Stack className='relative z-0'>
          <Stack space={4}>
            <StatusContent status={actualStatus} textSize='lg' translatable />

            <TranslateButton status={actualStatus} />

            {withMedia &&
              (quote ||
                actualStatus.card ||
                actualStatus.media_attachments.length > 0) && (
                <Stack space={4}>
                  {(actualStatus.media_attachments.length > 0 ||
                    (actualStatus.card && !quote)) && (
                    <div className='relative'>
                      <SensitiveContentOverlay status={status} />
                      <StatusMedia status={actualStatus} />
                    </div>
                  )}

                  {quote}
                </Stack>
              )}
          </Stack>
        </Stack>

        <StatusReactionsBar status={actualStatus} />

        <HStack
          justifyContent='between'
          alignItems='center'
          className='py-3'
          wrap
        >
          <StatusInteractionBar status={actualStatus} />

          <HStack space={1} alignItems='center'>
            <span>
              <a
                href={actualStatus.url}
                target='_blank'
                rel='noopener'
                className='hover:underline'
              >
                <Text tag='span' theme='muted' size='sm'>
                  <FormattedDate
                    value={new Date(actualStatus.created_at)}
                    hour12
                    year='numeric'
                    month='short'
                    day='2-digit'
                    hour='numeric'
                    minute='2-digit'
                  />
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
                      <FormattedMessage
                        id='status.edited'
                        defaultMessage='Edited {date}'
                        values={{
                          date: intl.formatDate(
                            new Date(actualStatus.edited_at),
                            {
                              hour12: true,
                              month: 'short',
                              day: '2-digit',
                              hour: 'numeric',
                              minute: '2-digit',
                            },
                          ),
                        }}
                      />
                    </Text>
                  </div>
                </>
              )}
            </span>

            <StatusTypeIcon status={actualStatus} />

            <StatusLanguagePicker status={status} showLabel />
          </HStack>
        </HStack>
      </div>
    </div>
  );
};

export { DetailedStatus as default };
