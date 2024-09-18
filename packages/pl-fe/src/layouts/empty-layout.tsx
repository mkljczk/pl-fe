import React from 'react';

import { Layout } from '../components/ui';

interface IEmptyLayout {
  children: React.ReactNode;
}

const EmptyLayout: React.FC<IEmptyLayout> = ({ children }) => (
  <>
    <Layout.Main>{children}</Layout.Main>

    <Layout.Aside />
  </>
);

export { EmptyLayout as default };
