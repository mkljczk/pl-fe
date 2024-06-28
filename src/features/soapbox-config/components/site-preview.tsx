import clsx from 'clsx';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

import { defaultSettings } from 'soapbox/actions/settings';
import BackgroundShapes from 'soapbox/features/ui/components/background-shapes';
import { useSystemTheme } from 'soapbox/hooks';
import { normalizeSoapboxConfig } from 'soapbox/normalizers';
import { generateThemeCss } from 'soapbox/utils/theme';

interface ISitePreview {
  /** Raw Soapbox configuration. */
  soapbox: any;
}

/** Renders a preview of the website's style with the configuration applied. */
const SitePreview: React.FC<ISitePreview> = ({ soapbox }) => {
  const soapboxConfig = useMemo(() => normalizeSoapboxConfig(soapbox), [soapbox]);
  const settings = defaultSettings.mergeDeep(soapboxConfig.defaultSettings);

  const userTheme = settings.get('themeMode');
  const systemTheme = useSystemTheme();

  const dark = ['dark', 'black'].includes(userTheme as string) || (userTheme === 'system' && systemTheme === 'dark');

  const bodyClass = clsx(
    'site-preview',
    'align-center relative flex justify-center text-base',
    'border border-solid border-gray-200 dark:border-gray-600',
    'h-40 overflow-hidden rounded-lg',
    {
      'bg-white': !dark,
      'bg-gray-900': dark,
    });

  return (
    <div className={bodyClass}>
      <style>{`.site-preview {${generateThemeCss(soapboxConfig)}}`}</style>
      <BackgroundShapes position='absolute' />

      <div className='absolute z-[2] self-center overflow-hidden rounded-lg bg-accent-500 p-2 text-white'>
        <FormattedMessage id='site_preview.preview' defaultMessage='Preview' />
      </div>

      <div
        className={clsx('absolute inset-0 z-[1] flex h-12 shadow lg:h-16', {
          'bg-white': !dark,
          'bg-gray-800': dark,
        })}
      />
    </div>
  );

};

export { SitePreview as default };
