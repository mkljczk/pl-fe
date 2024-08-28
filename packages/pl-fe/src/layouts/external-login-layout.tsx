import React from 'react';

import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'pl-fe/hooks';
import { isStandalone } from 'pl-fe/utils/state';

import { Layout } from '../components/ui';

interface IExternalLoginLayout {
  children: React.ReactNode;
}

const ExternalLoginLayout: React.FC<IExternalLoginLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();
  const standalone = useAppSelector(isStandalone);

  return (
    <>
      <Layout.Main>
        {children}

        {!me && (
          <CtaBanner />
        )}
      </Layout.Main>

      <Layout.Aside>
        {!me && !standalone && (
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

export { ExternalLoginLayout as default };
