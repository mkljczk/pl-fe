import React, { Suspense, useEffect, useRef } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { Redirect, Route, useHistory, RouteProps, RouteComponentProps, match as MatchType, useLocation } from 'react-router-dom';

import { Layout } from 'soapbox/components/ui';
import { useOwnAccount, useSettings } from 'soapbox/hooks';

import ColumnForbidden from '../components/column-forbidden';
import ColumnLoading from '../components/column-loading';
import ColumnsArea from '../components/columns-area';
import ErrorColumn from '../components/error-column';

type PageProps = {
  params?: MatchType['params'];
  layout?: any;
  children: React.ReactNode;
};

interface IWrappedRoute extends RouteProps {
  component: React.LazyExoticComponent<any>;
  page?: React.ComponentType<PageProps>;
  content?: React.ReactNode;
  componentParams?: Record<string, any>;
  layout?: any;
  publicRoute?: boolean;
  staffOnly?: boolean;
  adminOnly?: boolean;
  developerOnly?: boolean;
}

const WrappedRoute: React.FC<IWrappedRoute> = ({
  component: Component,
  page: Page,
  content,
  componentParams = {},
  layout,
  publicRoute = false,
  staffOnly = false,
  adminOnly = false,
  developerOnly = false,
  ...rest
}) => {
  const history = useHistory();

  const { account } = useOwnAccount();
  const { isDeveloper } = useSettings();

  const renderComponent = ({ match }: RouteComponentProps) => {
    if (Page) {
      return (
        <ErrorBoundary FallbackComponent={FallbackError}>
          <Suspense fallback={<FallbackLoading />}>
            <Page params={match.params} layout={layout} {...componentParams}>
              <Component params={match.params} {...componentParams}>
                {content}
              </Component>
            </Page>
          </Suspense>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary FallbackComponent={FallbackError}>
        <Suspense fallback={<FallbackLoading />}>
          <ColumnsArea layout={layout}>
            <Component params={match.params} {...componentParams}>
              {content}
            </Component>
          </ColumnsArea>
        </Suspense>
      </ErrorBoundary>
    );
  };

  const loginRedirect = () => {
    const actualUrl = encodeURIComponent(`${history.location.pathname}${history.location.search}`);
    localStorage.setItem('plfe:redirect_uri', actualUrl);
    return <Redirect to='/login' />;
  };

  const authorized = [
    account || publicRoute,
    developerOnly ? isDeveloper : true,
    staffOnly ? account && (account.is_admin || account.is_moderator) : true,
    adminOnly ? account && account.is_admin : true,
  ].every(c => c);

  if (!authorized) {
    if (!account) {
      return loginRedirect();
    } else {
      return <FallbackForbidden />;
    }
  }

  return <Route {...rest} render={renderComponent} />;
};

interface IFallbackLayout {
  children: JSX.Element;
}

const FallbackLayout: React.FC<IFallbackLayout> = ({ children }) => (
  <>
    <Layout.Main>
      {children}
    </Layout.Main>

    <Layout.Aside />
  </>
);

const FallbackLoading: React.FC = () => (
  <FallbackLayout>
    <ColumnLoading />
  </FallbackLayout>
);

const FallbackForbidden: React.FC = () => (
  <FallbackLayout>
    <ColumnForbidden />
  </FallbackLayout>
);

const FallbackError: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const location = useLocation();
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      resetErrorBoundary();
    }
  }, [location]);

  return (
    <FallbackLayout>
      <ErrorColumn error={error} onRetry={resetErrorBoundary} />
    </FallbackLayout>
  );
};

export {
  WrappedRoute,
};
