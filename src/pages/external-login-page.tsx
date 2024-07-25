import React from 'react';

import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  WhoToFollowPanel,
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'soapbox/hooks';
import { isStandalone } from 'soapbox/utils/state';

import { Layout } from '../components/ui';

interface IExternalLoginPage {
  children: React.ReactNode;
}

const ExternalLoginPage: React.FC<IExternalLoginPage> = ({ children }) => {
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

export { ExternalLoginPage as default };
