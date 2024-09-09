import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Column, Divider, Stack, Text } from 'pl-fe/components/ui';
import { useInstance } from 'pl-fe/hooks';

import LinkFooter from '../ui/components/link-footer';
import PromoPanel from '../ui/components/panels/promo-panel';

const messages = defineMessages({
  heading: { id: 'column.info', defaultMessage: 'Server information' },
});

const ServerInfo = () => {
  const intl = useIntl();
  const instance = useInstance();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <Stack>
          <Text size='lg' weight='medium'>{instance.title}</Text>
          <Text theme='muted'>{instance.description}</Text>
        </Stack>

        <Divider />

        <PromoPanel />

        <Divider />

        <LinkFooter />
      </Stack>
    </Column>
  );
};

export { ServerInfo as default };
