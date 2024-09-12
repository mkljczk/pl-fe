import React, { type ErrorInfo, useRef, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { FormattedMessage } from 'react-intl';

import { NODE_ENV } from 'pl-fe/build-config';
import { HStack, Text, Stack, Textarea } from 'pl-fe/components/ui';
import { useLogo, usePlFeConfig } from 'pl-fe/hooks';
import { captureSentryException } from 'pl-fe/sentry';
import KVStore from 'pl-fe/storage/kv-store';
import sourceCode from 'pl-fe/utils/code';
import { unregisterSW } from 'pl-fe/utils/sw';

import SentryFeedbackForm from './sentry-feedback-form';
import SiteLogo from './site-logo';

interface ISiteErrorBoundary {
  children: React.ReactNode;
}

/** Application-level error boundary. Fills the whole screen. */
const SiteErrorBoundary: React.FC<ISiteErrorBoundary> = ({ children }) => {
  const { links, sentryDsn } = usePlFeConfig();
  const logoSrc = useLogo();
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [error, setError] = useState<unknown>();
  const [componentStack, setComponentStack] = useState<string>();
  const [browser, setBrowser] = useState<Bowser.Parser.Parser>();
  const [sentryEventId, setSentryEventId] = useState<string>();

  const sentryEnabled = Boolean(sentryDsn);
  const isProduction = NODE_ENV === 'production';
  const errorText = String(error) + componentStack;

  const clearCookies: React.MouseEventHandler = (e) => {
    localStorage.clear();
    sessionStorage.clear();
    KVStore.clear();

    if ('serviceWorker' in navigator) {
      e.preventDefault();
      unregisterSW().then(goHome).catch(goHome);
    }
  };

  const handleCopy: React.MouseEventHandler = () => {
    if (!textarea.current) return;

    textarea.current.select();
    textarea.current.setSelectionRange(0, 99999);

    document.execCommand('copy');
  };

  const handleError = (error: Error, info: ErrorInfo) => {
    setError(error);
    setComponentStack(info.componentStack);

    captureSentryException(error, {
      tags: {
        // Allow page crashes to be easily searched in Sentry.
        ErrorBoundary: 'yes',
      },
    })
      .then((eventId) => setSentryEventId(eventId))
      .catch(console.error);

    import('bowser')
      .then(({ default: Bowser }) => setBrowser(Bowser.getParser(window.navigator.userAgent)))
      .catch(() => {});
  };

  const goHome = () => {
    location.href = '/';
  };

  const fallback = (
    <div className='flex h-screen flex-col bg-white pb-12 pt-16 black:bg-black dark:bg-primary-900'>
      <main className='mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 sm:px-6 lg:px-8'>
        {logoSrc && (
          <div className='flex shrink-0 justify-center'>
            <a href='/' className='inline-flex'>
              <SiteLogo className='h-12 w-auto cursor-pointer' />
            </a>
          </div>
        )}

        <div className='py-8'>
          <div className='mx-auto max-w-xl space-y-2 text-center'>
            <h1 className='text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-500'>
              <FormattedMessage id='alert.unexpected.message' defaultMessage='Something went wrong.' />
            </h1>
            <p className='text-lg text-gray-700 dark:text-gray-600'>
              <FormattedMessage
                id='alert.unexpected.body'
                defaultMessage="We're sorry for the interruption. If the problem persists, please reach out to our support team. You may also try to {clearCookies} (this will log you out)."
                values={{
                  clearCookies: (
                    <a href='/' onClick={clearCookies} className='text-primary-600 hover:underline dark:text-accent-blue'>
                      <FormattedMessage
                        id='alert.unexpected.clear_cookies'
                        defaultMessage='clear cookies and browser data'
                      />
                    </a>
                  ),
                }}
              />
            </p>

            <Text theme='muted'>
              <Text weight='medium' tag='span' theme='muted'>{sourceCode.displayName}:</Text>

              {' '}{sourceCode.version}
            </Text>

            <div className='mt-10'>
              <a href='/' className='text-base font-medium text-primary-600 hover:underline dark:text-accent-blue'>
                <FormattedMessage id='alert.unexpected.return_home' defaultMessage='Return Home' />
                {' '}
                <span className='inline-block rtl:rotate-180' aria-hidden='true'>&rarr;</span>
              </a>
            </div>
          </div>

          <div className='mx-auto max-w-lg space-y-4 py-16'>
            {(isProduction) ? (
              (sentryEnabled && sentryEventId) && (
                <SentryFeedbackForm eventId={sentryEventId} />
              )
            ) : (
              <>
                {errorText && (
                  <Textarea
                    ref={textarea}
                    value={errorText}
                    onClick={handleCopy}
                    isCodeEditor
                    rows={12}
                    readOnly
                  />
                )}

                {browser && (
                  <Stack>
                    <Text weight='semibold'><FormattedMessage id='alert.unexpected.browser' defaultMessage='Browser' /></Text>
                    <Text theme='muted'>{browser.getBrowserName()} {browser.getBrowserVersion()}</Text>
                  </Stack>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className='mx-auto w-full max-w-7xl shrink-0 px-4 sm:px-6 lg:px-8'>
        <HStack justifyContent='center' space={4} element='nav'>
          {links.get('status') && (
            <SiteErrorBoundaryLink href={links.get('status')!}>
              <FormattedMessage id='alert.unexpected.links.status' defaultMessage='Status' />
            </SiteErrorBoundaryLink>
          )}

          {links.get('help') && (
            <SiteErrorBoundaryLink href={links.get('help')!}>
              <FormattedMessage id='alert.unexpected.links.help' defaultMessage='Help Center' />
            </SiteErrorBoundaryLink>
          )}

          {links.get('support') && (
            <SiteErrorBoundaryLink href={links.get('support')!}>
              <FormattedMessage id='alert.unexpected.links.support' defaultMessage='Support' />
            </SiteErrorBoundaryLink>
          )}
        </HStack>
      </footer>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

interface ISiteErrorBoundaryLink {
  href: string;
  children: React.ReactNode;
}

const SiteErrorBoundaryLink = ({ href, children }: ISiteErrorBoundaryLink) => (
  <>
    <span className='inline-block border-l border-gray-300' aria-hidden='true' />
    <a href={href} className='text-sm font-medium text-gray-700 hover:underline dark:text-gray-600'>
      {children}
    </a>
  </>
);

export { SiteErrorBoundary as default };
