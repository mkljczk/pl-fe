import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { getSoapboxConfig } from 'soapbox/actions/soapbox';
import { Stack, Text } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  accountEntity: { id: 'report.confirmation.entity.account', defaultMessage: 'account' },
  title: { id: 'report.confirmation.title', defaultMessage: 'Thanks for submitting your report.' },
  content: { id: 'report.confirmation.content', defaultMessage: 'If we find that this {entity} is violating the {link} we will take further action on the matter.' },
});

const termsOfServiceText = (<FormattedMessage
  id='shared.tos'
  defaultMessage='Terms of Service'
/>);

const renderTermsOfServiceLink = (href: string) => (
  <a
    href={href}
    target='_blank'
    className='text-primary-600 hover:text-primary-800 hover:underline dark:text-accent-blue dark:hover:text-accent-blue'
  >
    {termsOfServiceText}
  </a>
);

const ConfirmationStep: React.FC = () => {
  const intl = useIntl();
  const links = useAppSelector((state) => getSoapboxConfig(state).get('links') as any);

  const entity = intl.formatMessage(messages.accountEntity);

  return (
    <Stack space={1}>
      <Text weight='semibold' tag='h1' size='xl'>
        {intl.formatMessage(messages.title)}
      </Text>

      <Text>
        {intl.formatMessage(messages.content, {
          entity,
          link: links.get('termsOfService') ?
            renderTermsOfServiceLink(links.get('termsOfService')) :
            termsOfServiceText,
        })}
      </Text>
    </Stack>
  );
};

export { ConfirmationStep as default };
