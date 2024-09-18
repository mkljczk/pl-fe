import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { deleteStatusModal } from 'pl-fe/actions/moderation';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import StatusContent from 'pl-fe/components/status-content';
import StatusMedia from 'pl-fe/components/status-media';
import { HStack, Stack } from 'pl-fe/components/ui';
import { useAppDispatch } from 'pl-fe/hooks';

import type { SelectedStatus } from 'pl-fe/selectors';

const messages = defineMessages({
  viewStatus: {
    id: 'admin.reports.actions.view_status',
    defaultMessage: 'View post',
  },
  deleteStatus: {
    id: 'admin.statuses.actions.delete_status',
    defaultMessage: 'Delete post',
  },
});

interface IReportStatus {
  status: SelectedStatus;
}

const ReportStatus: React.FC<IReportStatus> = ({ status }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleDeleteStatus = () => {
    dispatch(deleteStatusModal(intl, status.id));
  };

  const makeMenu = () => {
    const acct = status.account.acct;

    return [
      {
        text: intl.formatMessage(messages.viewStatus, { acct: `@${acct}` }),
        to: `/@${acct}/posts/${status.id}`,
        icon: require('@tabler/icons/outline/pencil.svg'),
      },
      {
        text: intl.formatMessage(messages.deleteStatus, { acct: `@${acct}` }),
        action: handleDeleteStatus,
        icon: require('@tabler/icons/outline/trash.svg'),
        destructive: true,
      },
    ];
  };

  const menu = makeMenu();

  return (
    <HStack space={2} alignItems='start'>
      <Stack space={2} className='overflow-hidden' grow>
        <StatusContent status={status} />
        <StatusMedia status={status} />
      </Stack>

      <div className='flex-none'>
        <DropdownMenu
          items={menu}
          src={require('@tabler/icons/outline/dots-vertical.svg')}
        />
      </div>
    </HStack>
  );
};

export { ReportStatus as default };
