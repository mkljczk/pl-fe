import React from 'react';

import LinkFooter from 'soapbox/features/ui/components/link-footer';
import {
  TrendsPanel,
  SignUpPanel,
  CtaBanner,
} from 'soapbox/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'soapbox/hooks';

import { Layout } from '../components/ui';

interface ILandingLayout {
  children: React.ReactNode;
}

const LandingLayout: React.FC<ILandingLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main className='space-y-3 pt-3 sm:pt-0 dark:divide-gray-800'>
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
        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { LandingLayout as default };
