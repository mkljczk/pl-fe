import React from 'react';
import { useIntl, defineMessages } from 'react-intl';

import { prepareRequest } from 'pl-fe/actions/consumer-auth';
import { IconButton, Tooltip } from 'pl-fe/components/ui';
import { useAppDispatch } from 'pl-fe/hooks';
import { capitalize } from 'pl-fe/utils/strings';

const messages = defineMessages({
  tooltip: { id: 'oauth_consumer.tooltip', defaultMessage: 'Sign in with {provider}' },
});

/** Map between OAuth providers and brand icons. */
const BRAND_ICONS: Record<string, string> = {
  twitter: require('@tabler/icons/outline/brand-twitter.svg'),
  facebook: require('@tabler/icons/outline/brand-facebook.svg'),
  google: require('@tabler/icons/outline/brand-google.svg'),
  microsoft: require('@tabler/icons/outline/brand-windows.svg'),
  slack: require('@tabler/icons/outline/brand-slack.svg'),
  github: require('@tabler/icons/outline/brand-github.svg'),
};

interface IConsumerButton {
  provider: string;
}

/** OAuth consumer button for logging in with a third-party service. */
const ConsumerButton: React.FC<IConsumerButton> = ({ provider }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const icon = BRAND_ICONS[provider] || require('@tabler/icons/outline/key.svg');

  const handleClick = () => {
    dispatch(prepareRequest(provider));
  };

  return (
    <Tooltip text={intl.formatMessage(messages.tooltip, { provider: capitalize(provider) })}>
      <IconButton
        theme='outlined'
        className='p-2.5'
        iconClassName='h-6 w-6'
        src={icon}
        onClick={handleClick}
      />
    </Tooltip>
  );
};

export { ConsumerButton as default };
