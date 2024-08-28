import clsx from 'clsx';
import React, { useEffect } from 'react';

import {
  useSettings,
  useSoapboxConfig,
  useTheme,
  useLocale,
  useAppSelector,
} from 'soapbox/hooks';
import { userTouching } from 'soapbox/is-mobile';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import { startSentry } from 'soapbox/sentry';
import { generateThemeCss } from 'soapbox/utils/theme';

const Helmet = React.lazy(() => import('soapbox/components/helmet'));

interface ISoapboxHead {
  children: React.ReactNode;
}

/** Injects metadata into site head with Helmet. */
const SoapboxHead: React.FC<ISoapboxHead> = ({ children }) => {
  const { locale, direction } = useLocale();
  const { demo, reduceMotion, underlineLinks, demetricator, systemFont } = useSettings();
  const soapboxConfig = useSoapboxConfig();
  const theme = useTheme();

  const withModals = useAppSelector((state) => !state.modals.isEmpty() || (state.dropdown_menu.isOpen && userTouching.matches));

  const themeCss = generateThemeCss(demo ? normalizeSoapboxConfig({ brandColor: '#0482d8' }) : soapboxConfig);
  const dsn = soapboxConfig.sentryDsn;

  const bodyClass = clsx('h-full bg-white text-base antialiased black:bg-black dark:bg-gray-800', {
    'no-reduce-motion': !reduceMotion,
    'underline-links': underlineLinks,
    'demetricator': demetricator,
    'system-font': systemFont,
    'overflow-hidden': withModals,
  });

  useEffect(() => {
    if (dsn) {
      startSentry(dsn).catch(console.error);
    }
  }, [dsn]);

  return (
    <>
      <Helmet>
        <html lang={locale} className={clsx('h-full', { 'dark': theme === 'dark', 'dark black': theme === 'black' })} />
        <body className={bodyClass} dir={direction} />
        {themeCss && <style id='theme' type='text/css'>{`:root{${themeCss}}`}</style>}
        {['dark', 'black'].includes(theme) && <style type='text/css'>{':root { color-scheme: dark; }'}</style>}
        <meta name='theme-color' content={soapboxConfig.brandColor} />
      </Helmet>

      {children}
    </>
  );
};

export { SoapboxHead as default };
