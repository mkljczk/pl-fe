import React, { useCallback } from 'react';

import { HStack, Icon, Text } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface IQuotedStatusIndicator {
  /** The quoted status id. */
  statusId: string;
}

const QuotedStatusIndicator: React.FC<IQuotedStatusIndicator> = ({ statusId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: statusId }));

  if (!status) return null;

  return (
    <HStack alignItems='center' space={1}>
      <Icon className='h-5 w-5' src={require('@tabler/icons/outline/quote.svg')} aria-hidden />
      <Text truncate>{status.url}</Text>
    </HStack>
  );
};

export { QuotedStatusIndicator as default };
