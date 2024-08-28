import React from 'react';

import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'pl-fe/hooks';

import { Layout } from '../components/ui';

interface IDefaultLayout {
  children: React.ReactNode;
}

const DefaultLayout: React.FC<IDefaultLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main>
        {children}

        {!me && (
          <CtaBanner />
        )}
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
        <LinkFooter key='link-footer' />
      </Layout.Aside>
    </>
  );
};

export { DefaultLayout as default };
