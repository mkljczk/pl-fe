import React from 'react';
import { Helmet } from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Column, Layout, Tabs } from 'pl-fe/components/ui';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  EventHeader,
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'pl-fe/hooks';
import { useStatus } from 'pl-fe/pl-hooks/hooks/statuses/useStatus';

interface IEventLayout {
  params?: {
    statusId?: string;
  };
  children: React.ReactNode;
}

const EventLayout: React.FC<IEventLayout> = ({ params, children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  const history = useHistory();
  const statusId = params?.statusId!;

  const { data: status } = useStatus(statusId);

  const event = status?.event;

  if (status && !event) {
    history.push(`/@${status.account.acct}/posts/${status.id}`);
    return (
      <PlaceholderStatus />
    );
  }

  const pathname = history.location.pathname;
  const activeItem = pathname.endsWith('/discussion') ? 'discussion' : 'info';

  const tabs = status ? [
    {
      text: <FormattedMessage id='event.information' defaultMessage='Information' />,
      to: `/@${status.account.acct}/events/${status.id}`,
      name: 'info',
    },
    {
      text: <FormattedMessage id='event.discussion' defaultMessage='Discussion' />,
      to: `/@${status.account.acct}/events/${status.id}/discussion`,
      name: 'discussion',
    },
  ] : [];

  const showTabs = !['/participations', 'participation_requests'].some(path => pathname.endsWith(path));

  return (
    <>
      {status?.account.local === false && (
        <Helmet>
          <meta content='noindex, noarchive' name='robots' />
        </Helmet>
      )}
      <Layout.Main>
        <Column label={event?.name} withHeader={false}>
          <div className='space-y-4'>
            <EventHeader status={status || undefined} />

            {status && showTabs && (
              <Tabs key={`event-tabs-${statusId}`} items={tabs} activeItem={activeItem} />
            )}

            {children}
          </div>
        </Column>
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { EventLayout as default };
