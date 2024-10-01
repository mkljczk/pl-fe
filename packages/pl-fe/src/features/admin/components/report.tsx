import React, { useCallback, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { Link } from 'react-router-dom';

import { closeReport } from 'pl-fe/actions/admin';
import { deactivateUserModal, deleteUserModal } from 'pl-fe/actions/moderation';
import DropdownMenu from 'pl-fe/components/dropdown-menu';
import HoverRefWrapper from 'pl-fe/components/hover-ref-wrapper';
import { Accordion, Avatar, Button, Stack, HStack, Text } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';
import { makeGetReport } from 'pl-fe/selectors';
import toast from 'pl-fe/toast';

import ReportStatus from './report-status';

const messages = defineMessages({
  reportClosed: { id: 'admin.reports.report_closed_message', defaultMessage: 'Report on @{name} was closed' },
  deactivateUser: { id: 'admin.users.actions.deactivate_user', defaultMessage: 'Deactivate @{name}' },
  deleteUser: { id: 'admin.users.actions.delete_user', defaultMessage: 'Delete @{name}' },
});

interface IReport {
  id: string;
}

const Report: React.FC<IReport> = ({ id }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getReport = useCallback(makeGetReport(), []);

  const report = useAppSelector((state) => getReport(state, id));

  const [accordionExpanded, setAccordionExpanded] = useState(false);

  if (!report) return null;

  const account = report.account;
  const targetAccount = report.target_account!;

  const makeMenu = () => [{
    text: intl.formatMessage(messages.deactivateUser, { name: targetAccount.username }),
    action: handleDeactivateUser,
    icon: require('@tabler/icons/outline/hourglass-empty.svg'),
  }, {
    text: intl.formatMessage(messages.deleteUser, { name: targetAccount.username }),
    action: handleDeleteUser,
    icon: require('@tabler/icons/outline/trash.svg'),
    destructive: true,
  }];

  const handleCloseReport = () => {
    dispatch(closeReport(report.id)).then(() => {
      const message = intl.formatMessage(messages.reportClosed, { name: targetAccount.username as string });
      toast.success(message);
    }).catch(() => {});
  };

  const handleDeactivateUser = () => {
    const accountId = targetAccount.id;
    dispatch(deactivateUserModal(intl, accountId!, () => handleCloseReport()));
  };

  const handleDeleteUser = () => {
    const accountId = targetAccount.id as string;
    dispatch(deleteUserModal(intl, accountId!, () => handleCloseReport()));
  };

  const handleAccordionToggle = (setting: boolean) => {
    setAccordionExpanded(setting);
  };

  const menu = makeMenu();
  const statuses = report.statuses;
  const statusCount = statuses.length;
  const acct = targetAccount.acct;
  const reporterAcct = account?.acct;

  return (
    <HStack space={3} className='p-3' key={report.id}>
      <HoverRefWrapper accountId={targetAccount.id} inline>
        <Link to={`/@${acct}`} title={acct}>
          <Avatar
            src={targetAccount.avatar}
            alt={targetAccount.avatar_description}
            size={32}
            className='overflow-hidden'
          />
        </Link>
      </HoverRefWrapper>

      <Stack space={3} className='overflow-hidden' grow>
        <Text tag='h4' weight='bold'>
          <FormattedMessage
            id='admin.reports.report_title'
            defaultMessage='Report on {acct}'
            values={{ acct: (
              <HoverRefWrapper accountId={targetAccount.id} inline>
                <Link to={`/@${acct}`} title={acct}>@{acct}</Link>
              </HoverRefWrapper>
            ) }}
          />
        </Text>

        {statusCount > 0 && (
          <Accordion
            headline={`Reported posts (${statusCount})`}
            expanded={accordionExpanded}
            onToggle={handleAccordionToggle}
          >
            <Stack space={4}>
              {statuses.map(status => (
                <ReportStatus
                  key={status.id}
                  status={status}
                />
              ))}
            </Stack>
          </Accordion>
        )}

        <Stack>
          {!!report.comment && report.comment.length > 0 && (
            <Text
              tag='blockquote'
              dangerouslySetInnerHTML={{ __html: report.comment }}
            />
          )}

          {!!account && (
            <HStack space={1}>
              <Text theme='muted' tag='span'>&mdash;</Text>

              <HoverRefWrapper accountId={account.id} inline>
                <Link
                  to={`/@${reporterAcct}`}
                  title={reporterAcct}
                  className='text-primary-600 dark:text-accent-blue hover:underline'
                >
                  @{reporterAcct}
                </Link>
              </HoverRefWrapper>
            </HStack>
          )}
        </Stack>
      </Stack>

      <HStack space={2} alignItems='start' className='flex-none'>
        <Button onClick={handleCloseReport}>
          <FormattedMessage id='admin.reports.actions.close' defaultMessage='Close' />
        </Button>

        <DropdownMenu items={menu} src={require('@tabler/icons/outline/dots-vertical.svg')} />
      </HStack>
    </HStack>
  );
};

export { Report as default };
