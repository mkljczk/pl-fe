import React from 'react';
import {
  FormattedDate,
  FormattedMessage,
  defineMessages,
  useIntl,
} from 'react-intl';

import { useAnnouncements } from 'pl-fe/api/hooks/admin/useAnnouncements';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Button, Column, HStack, Stack, Text } from 'pl-fe/components/ui';
import { AdminAnnouncement } from 'pl-fe/normalizers';
import { useModalsStore } from 'pl-fe/stores';
import toast from 'pl-fe/toast';

const messages = defineMessages({
  heading: {
    id: 'column.admin.announcements',
    defaultMessage: 'Announcements',
  },
  deleteConfirm: {
    id: 'confirmations.admin.delete_announcement.confirm',
    defaultMessage: 'Delete',
  },
  deleteHeading: {
    id: 'confirmations.admin.delete_announcement.heading',
    defaultMessage: 'Delete announcement',
  },
  deleteMessage: {
    id: 'confirmations.admin.delete_announcement.message',
    defaultMessage: 'Are you sure you want to delete the announcement?',
  },
  deleteSuccess: {
    id: 'admin.edit_announcement.deleted',
    defaultMessage: 'Announcement deleted',
  },
});

interface IAnnouncement {
  announcement: AdminAnnouncement;
}

const Announcement: React.FC<IAnnouncement> = ({ announcement }) => {
  const intl = useIntl();
  const { deleteAnnouncement } = useAnnouncements();
  const { openModal } = useModalsStore();

  const handleEditAnnouncement = () => {
    openModal('EDIT_ANNOUNCEMENT', { announcement });
  };

  const handleDeleteAnnouncement = () => {
    openModal('CONFIRM', {
      heading: intl.formatMessage(messages.deleteHeading),
      message: intl.formatMessage(messages.deleteMessage),
      confirm: intl.formatMessage(messages.deleteConfirm),
      onConfirm: () =>
        deleteAnnouncement(announcement.id, {
          onSuccess: () => toast.success(messages.deleteSuccess),
        }),
    });
  };

  return (
    <div
      key={announcement.id}
      className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'
    >
      <Stack space={2}>
        <Text dangerouslySetInnerHTML={{ __html: announcement.contentHtml }} />
        {(announcement.starts_at ||
          announcement.ends_at ||
          announcement.all_day) && (
          <HStack space={2} wrap>
            {announcement.starts_at && (
              <Text size='sm'>
                <Text tag='span' size='sm' weight='medium'>
                  <FormattedMessage
                    id='admin.announcements.starts_at'
                    defaultMessage='Starts at:'
                  />
                </Text>{' '}
                <FormattedDate
                  value={announcement.starts_at}
                  year='2-digit'
                  month='short'
                  day='2-digit'
                  weekday='short'
                />
              </Text>
            )}
            {announcement.ends_at && (
              <Text size='sm'>
                <Text tag='span' size='sm' weight='medium'>
                  <FormattedMessage
                    id='admin.announcements.ends_at'
                    defaultMessage='Ends at:'
                  />
                </Text>{' '}
                <FormattedDate
                  value={announcement.ends_at}
                  year='2-digit'
                  month='short'
                  day='2-digit'
                  weekday='short'
                />
              </Text>
            )}
            {announcement.all_day && (
              <Text weight='medium' size='sm'>
                <FormattedMessage
                  id='admin.announcements.all_day'
                  defaultMessage='All day'
                />
              </Text>
            )}
          </HStack>
        )}
        <HStack justifyContent='end' space={2}>
          <Button theme='primary' onClick={handleEditAnnouncement}>
            <FormattedMessage
              id='admin.announcements.edit'
              defaultMessage='Edit'
            />
          </Button>
          <Button theme='primary' onClick={handleDeleteAnnouncement}>
            <FormattedMessage
              id='admin.announcements.delete'
              defaultMessage='Delete'
            />
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const Announcements: React.FC = () => {
  const intl = useIntl();
  const { openModal } = useModalsStore();

  const { data: announcements, isLoading } = useAnnouncements();

  const handleCreateAnnouncement = () => {
    openModal('EDIT_ANNOUNCEMENT');
  };

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.admin.announcements'
      defaultMessage='There are no announcements yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack className='gap-4'>
        <Button
          className='sm:w-fit sm:self-end'
          icon={require('@tabler/icons/outline/plus.svg')}
          onClick={handleCreateAnnouncement}
          theme='secondary'
          block
        >
          <FormattedMessage
            id='admin.announcements.action'
            defaultMessage='Create announcement'
          />
        </Button>
        <ScrollableList
          scrollKey='announcements'
          emptyMessage={emptyMessage}
          itemClassName='py-3 first:pt-0 last:pb-0'
          isLoading={isLoading}
          showLoading={isLoading && !announcements?.length}
        >
          {announcements!.map((announcement) => (
            <Announcement key={announcement.id} announcement={announcement} />
          ))}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export { Announcements as default };
