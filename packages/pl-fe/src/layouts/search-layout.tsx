import React from 'react';

import LinkFooter from 'pl-fe/features/ui/components/link-footer';
import {
  SignUpPanel,
  TrendsPanel,
  WhoToFollowPanel,
} from 'pl-fe/features/ui/util/async-components';
import { useAppSelector, useFeatures } from 'pl-fe/hooks';

import { Layout } from '../components/ui';

interface ISearchLayout {
  children: React.ReactNode;
}

const SearchLayout: React.FC<ISearchLayout> = ({ children }) => {
  const me = useAppSelector((state) => state.me);
  const features = useFeatures();

  return (
    <>
      <Layout.Main>{children}</Layout.Main>

      <Layout.Aside>
        {!me && <SignUpPanel />}

        {features.trends && <TrendsPanel limit={5} />}

        {me && features.suggestions && <WhoToFollowPanel limit={3} />}

        <LinkFooter />
      </Layout.Aside>
    </>
  );
};

export { SearchLayout as default };
