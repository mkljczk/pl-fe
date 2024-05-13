import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppSelector, useInstance, useRegistrationStatus } from 'soapbox/hooks';

const SignUpPanel = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const me = useAppSelector((state) => state.me);

  if (me || !isOpen) return null;

  return (
    <Stack space={2} data-testid='sign-up-panel'>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='signup_panel.title' defaultMessage='New to {site_title}?' values={{ site_title: instance.title }} />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='signup_panel.subtitle' defaultMessage="Sign up now to discuss what's happening." />
        </Text>
      </Stack>

      <Button
        theme='primary'
        to='/signup'
        block
      >
        <FormattedMessage id='account.register' defaultMessage='Sign up' />
      </Button>
    </Stack>
  );
};

export { SignUpPanel as default };
