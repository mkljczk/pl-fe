import React from 'react';

import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import { WhoToFollowPanel, TrendsPanel, SignUpPanel } from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'pl-fe/hooks';

import { Layout } from '../components/ui';

interface IStatusLayout {
  children: React.ReactNode;
}

const StatusLayout: React.FC<IStatusLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        {children}
      </Layout.Main>

      <Layout.Aside>
        {!me && (
          <SignUpPanel />
        )}
        {features.trends && (
          <TrendsPanel limit={5} />
        )}
        {me && features.suggestions && (
          <WhoToFollowPanel limit={3} />
        )}
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { StatusLayout as default };
