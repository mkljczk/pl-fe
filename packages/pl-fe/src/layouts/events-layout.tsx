import React from 'react';

import { Layout } from 'soapbox/components/ui';
import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  NewEventPanel,
} from 'soapbox/features/ui/util/async-components';
import { useFeatures } from 'soapbox/hooks';

interface IEventsLayout {
  children: React.ReactNode;
}

/** Layout to display events list. */
const EventsLayout: React.FC<IEventsLayout> = ({ children }) => {
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        <NewEventPanel />
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

export { EventsLayout as default };
