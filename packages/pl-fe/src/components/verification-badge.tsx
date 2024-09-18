import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Icon } from 'pl-fe/components/ui';
import { usePlFeConfig } from 'pl-fe/hooks';

const messages = defineMessages({
  verified: { id: 'account.verified', defaultMessage: 'Verified Account' },
});

interface IVerificationBadge {
  className?: string;
}

const VerificationBadge: React.FC<IVerificationBadge> = ({ className }) => {
  const intl = useIntl();
  const plFeConfig = usePlFeConfig();

  // Prefer a custom icon if found
  const icon =
    plFeConfig.verifiedIcon || require('pl-fe/assets/icons/verified.svg');

  // Render component based on file extension
  const Element = icon.endsWith('.svg') ? Icon : 'img';

  return (
    <span className='verified-icon' data-testid='verified-badge'>
      <Element
        className={clsx('w-4 text-accent-500', className)}
        src={icon}
        alt={intl.formatMessage(messages.verified)}
      />
    </span>
  );
};

export { VerificationBadge as default };
