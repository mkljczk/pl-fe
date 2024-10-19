import React from 'react';
import { FormattedMessage } from 'react-intl';

import Card, { CardBody } from 'pl-fe/components/ui/card';
import Stack from 'pl-fe/components/ui/stack';
import Text from 'pl-fe/components/ui/text';

interface MissingIndicatorProps {
  nested?: boolean;
}

const MissingIndicator = ({ nested = false }: MissingIndicatorProps): JSX.Element => (
  <Card variant={nested ? undefined : 'rounded'} size='lg'>
    <CardBody>
      <Stack space={2}>
        <Text weight='medium' align='center' size='lg'>
          <FormattedMessage id='missing_indicator.label' tagName='strong' defaultMessage='Not found' />
        </Text>

        <Text theme='muted' align='center'>
          <FormattedMessage id='missing_indicator.sublabel' defaultMessage='This resource could not be found' />
        </Text>
      </Stack>
    </CardBody>
  </Card>
);

export { MissingIndicator as default };
