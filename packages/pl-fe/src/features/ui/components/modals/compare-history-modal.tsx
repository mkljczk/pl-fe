import React, { useEffect } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { fetchHistory } from 'pl-fe/actions/history';
import AttachmentThumbs from 'pl-fe/components/attachment-thumbs';
import { HStack, Modal, Spinner, Stack, Text } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

import type { BaseModalProps } from '../modal-root';

interface CompareHistoryModalProps {
  statusId: string;
}

const CompareHistoryModal: React.FC<BaseModalProps & CompareHistoryModalProps> = ({ onClose, statusId }) => {
  const dispatch = useAppDispatch();

  const loading = useAppSelector(state => state.history.getIn([statusId, 'loading']));
  const versions = useAppSelector(state => state.history.get(statusId)?.items);

  const onClickClose = () => {
    onClose('COMPARE_HISTORY');
  };

  useEffect(() => {
    dispatch(fetchHistory(statusId));
  }, [statusId]);

  let body;

  if (loading) {
    body = <Spinner />;
  } else {
    body = (
      <div className='divide-y divide-solid divide-gray-200 dark:divide-gray-800'>
        {versions?.map((version) => {
          const content = { __html: version.contentHtml };
          const spoilerContent = { __html: version.spoilerHtml };

          const poll = typeof version.poll !== 'string' && version.poll;

          return (
            <div className='flex flex-col py-2 first:pt-0 last:pb-0'>
              {version.spoiler_text?.length > 0 && (
                <>
                  <span dangerouslySetInnerHTML={spoilerContent} />
                  <hr />
                </>
              )}

              <div className='status__content' dangerouslySetInnerHTML={content} />

              {poll && (
                <div className='poll'>
                  <Stack>
                    {poll.options.map((option: any) => (
                      <HStack alignItems='center' className='p-1 text-gray-900 dark:text-gray-300'>
                        <span
                          className='mr-2.5 inline-block h-4 w-4 flex-none rounded-full border border-solid border-primary-600'
                          tabIndex={0}
                          role='radio'
                        />

                        <span dangerouslySetInnerHTML={{ __html: option.title_emojified }} />
                      </HStack>
                    ))}
                  </Stack>
                </div>
              )}

              {version.media_attachments.length > 0 && (
                <AttachmentThumbs media={version.media_attachments} />
              )}

              <Text align='right' tag='span' theme='muted' size='sm'>
                <FormattedDate value={new Date(version.created_at)} hour12 year='numeric' month='short' day='2-digit' hour='numeric' minute='2-digit' />
              </Text>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Modal
      title={<FormattedMessage id='compare_history_modal.header' defaultMessage='Edit history' />}
      onClose={onClickClose}
    >
      {body}
    </Modal>
  );
};

export { type CompareHistoryModalProps, CompareHistoryModal as default };
