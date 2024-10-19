import React from 'react';

import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  TrendsPanel,
  SignUpPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'pl-fe/hooks';

import Layout from 'pl-fe/components/ui/layout';

interface ILandingLayout {
  children: React.ReactNode;
}

const LandingLayout: React.FC<ILandingLayout> = ({ children }) => {
  const me = useAppSelector(state => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main className='space-y-3 pt-3 dark:divide-gray-800 sm:pt-0'>
        {children}
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
