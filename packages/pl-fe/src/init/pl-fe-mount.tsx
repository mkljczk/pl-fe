import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
import { CompatRouter } from 'react-router-dom-v5-compat';
// @ts-ignore: it doesn't have types
import { ScrollContext } from 'react-router-scroll-4';

import * as BuildConfig from 'pl-fe/build-config';
import LoadingScreen from 'pl-fe/components/loading-screen';
import SiteErrorBoundary from 'pl-fe/components/site-error-boundary';
import { ModalRoot, OnboardingWizard } from 'pl-fe/features/ui/util/async-components';
import {
  useAppSelector,
  useLoggedIn,
  useOwnAccount,
  usePlFeConfig,
} from 'pl-fe/hooks';
import { useCachedLocationHandler } from 'pl-fe/utils/redirect';

const GdprBanner = React.lazy(() => import('pl-fe/components/gdpr-banner'));
const EmbeddedStatus = React.lazy(() => import('pl-fe/features/embedded-status'));
const UI = React.lazy(() => import('pl-fe/features/ui'));

/** Highest level node with the Redux store. */
const PlFeMount = () => {
  useCachedLocationHandler();

  const { isLoggedIn } = useLoggedIn();
  const { account } = useOwnAccount();
  const plFeConfig = usePlFeConfig();

  const needsOnboarding = useAppSelector(state => state.onboarding.needsOnboarding);
  const showOnboarding = account && needsOnboarding;
  const { redirectRootNoLogin, gdpr } = plFeConfig;

  // @ts-ignore: I don't actually know what these should be, lol
  const shouldUpdateScroll = (prevRouterProps, { location }) =>
    !(location.state?.plFeModalKey && location.state?.plFeModalKey !== prevRouterProps?.location?.state?.plFeModalKey)
    && !(location.state?.plFeDropdownKey && location.state?.plFeDropdownKey !== prevRouterProps?.location?.state?.plFeDropdownKey);

  return (
    <SiteErrorBoundary>
      <BrowserRouter basename={BuildConfig.FE_SUBDIRECTORY}>
        <CompatRouter>
          <ScrollContext shouldUpdateScroll={shouldUpdateScroll}>
            <Switch>
              {(!isLoggedIn && redirectRootNoLogin) && (
                <Redirect exact from='/' to={redirectRootNoLogin} />
              )}

              <Route
                path='/embed/:statusId'
                render={(props) => (
                  <Suspense>
                    <EmbeddedStatus params={props.match.params} />
                  </Suspense>
                )}
              />

              <Redirect from='/@:username/:statusId/embed' to='/embed/:statusId' />

              <Route>
                <Suspense fallback={<LoadingScreen />}>
                  {showOnboarding
                    ? <OnboardingWizard />
                    : <UI />
                  }
                </Suspense>

                <Suspense>
                  <ModalRoot />
                </Suspense>

                {(gdpr && !isLoggedIn) && (
                  <Suspense>
                    <GdprBanner />
                  </Suspense>
                )}

                <div id='toaster'>
                  <Toaster
                    position='top-right'
                    containerClassName='top-4'
                  />
                </div>
              </Route>
            </Switch>
          </ScrollContext>
        </CompatRouter>
      </BrowserRouter>
    </SiteErrorBoundary>
  );
};

export { PlFeMount as default };
