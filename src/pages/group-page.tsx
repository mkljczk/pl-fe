import React, { useMemo } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';

import { useGroup, useGroupMembershipRequests } from 'soapbox/api/hooks';
import { Column, Icon, Layout, Stack, Text, Tabs } from 'soapbox/components/ui';
import GroupHeader from 'soapbox/features/group/components/group-header';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  CtaBanner,
  GroupMediaPanel,
  SignUpPanel,
} from 'soapbox/features/ui/util/async-components';
import { useOwnAccount } from 'soapbox/hooks';

const messages = defineMessages({
  all: { id: 'group.tabs.all', defaultMessage: 'All' },
  members: { id: 'group.tabs.members', defaultMessage: 'Members' },
  media: { id: 'group.tabs.media', defaultMessage: 'Media' },
});

interface IGroupPage {
  params?: {
    groupId?: string;
  };
  children: React.ReactNode;
}

const PrivacyBlankslate = () => (
  <Stack space={4} className='py-10' alignItems='center'>
    <div className='rounded-full bg-gray-200 p-3 dark:bg-gray-800'>
      <Icon
        src={require('@tabler/icons/outline/eye-off.svg')}
        className='h-6 w-6 text-gray-600 dark:text-gray-600'
      />
    </div>

    <Text theme='muted'>
      <FormattedMessage
        id='group.private.message'
        defaultMessage='Content is only visible to group members'
      />
    </Text>
  </Stack>
);

/** Page to display a group. */
const GroupPage: React.FC<IGroupPage> = ({ params, children }) => {
  const intl = useIntl();
  const match = useRouteMatch();
  const { account: me } = useOwnAccount();

  const groupId = params?.groupId || '';

  const { group } = useGroup(groupId);
  const { accounts: pending } = useGroupMembershipRequests(groupId);

  const isMember = !!group?.relationship?.member;
  const isPrivate = group?.locked;

  const tabItems = useMemo(() => {
    const items = [];
    items.push({
      text: intl.formatMessage(messages.all),
      to: `/groups/${groupId}`,
      name: '/groups/:groupId',
    });

    items.push(
      {
        text: intl.formatMessage(messages.media),
        to: `/groups/${groupId}/media`,
        name: '/groups/:groupId/media',
      },
      {
        text: intl.formatMessage(messages.members),
        to: `/groups/${groupId}/members`,
        name: '/groups/:groupId/members',
        count: pending.length,
      },
    );

    return items;
  }, [pending.length, groupId]);

  const renderChildren = () => {
    if (!isMember && isPrivate) {
      return <PrivacyBlankslate />;
    } else {
      return children;
    }
  };

  return (
    <>
      <Layout.Main>
        <Column size='lg' label={group ? group.display_name : ''} withHeader={false}>
          <GroupHeader group={group} />

          <Tabs
            key={`group-tabs-${groupId}`}
            items={tabItems}
            activeItem={match.path}
          />

          {renderChildren()}
        </Column>

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        <GroupMediaPanel group={group} />
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { GroupPage as default };
