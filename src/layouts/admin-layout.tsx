import React from 'react';

import { Layout } from 'soapbox/components/ui';
import { LatestAccountsPanel } from 'soapbox/features/ui/util/async-components';

import LinkFooter from '../features/ui/components/link-footer';

interface IAdminLayout {
  children: React.ReactNode;
}

const AdminLayout: React.FC<IAdminLayout> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside>
      <LatestAccountsPanel limit={5} />
      <LinkFooter />
    </Layout.Aside>
  </>
);

export { AdminLayout as default };
