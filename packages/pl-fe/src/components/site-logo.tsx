import clsx from 'clsx';
import React from 'react';

import { useLogo } from 'pl-fe/hooks';

interface ISiteLogo extends React.ComponentProps<'img'> {
  /** Extra class names for the <img> element. */
  className?: string;
  /** Override theme setting for <SitePreview /> */
  theme?: 'dark' | 'light';
}

/** Display the most appropriate site logo based on the theme and configuration. */
const SiteLogo: React.FC<ISiteLogo> = ({ className, theme, ...rest }) => {
  const logoSrc = useLogo();

  if (!logoSrc) return null;

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      className={clsx('object-contain', className)}
      src={logoSrc}
      {...rest}
    />
  );
};

export { SiteLogo as default };
