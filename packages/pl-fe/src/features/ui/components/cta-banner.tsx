import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Banner, Button, HStack, Stack, Text } from 'soapbox/components/ui';
import { useAppSelector, useInstance, useRegistrationStatus, useSoapboxConfig } from 'soapbox/hooks';

const CtaBanner = () => {
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const { displayCta } = useSoapboxConfig();
  const me = useAppSelector((state) => state.me);

  if (me || !displayCta || !isOpen) return null;

  return (
    <div data-testid='cta-banner' className='hidden lg:block'>
      <Banner theme='frosted'>
        <HStack alignItems='center' justifyContent='between'>
          <Stack>
            <Text theme='white' size='xl' weight='bold'>
              <FormattedMessage id='signup_panel.title' defaultMessage='New to {site_title}?' values={{ site_title: instance.title }} />
            </Text>

            <Text theme='white' weight='medium' className='opacity-90'>
              <FormattedMessage id='signup_panel.subtitle' defaultMessage="Sign up now to discuss what's happening." />
            </Text>
          </Stack>

          <HStack space={2} alignItems='center'>
            <Button theme='secondary' to='/login'>
              <FormattedMessage id='account.login' defaultMessage='Log in' />
            </Button>

            <Button theme='accent' to='/signup'>
              <FormattedMessage id='account.register' defaultMessage='Sign up' />
            </Button>
          </HStack>
        </HStack>
      </Banner>
    </div>
  );
};

export { CtaBanner as default };
