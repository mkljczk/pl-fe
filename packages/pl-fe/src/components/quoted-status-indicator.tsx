import React, { useCallback } from 'react';

import { HStack, Icon, Text } from 'pl-fe/components/ui';
import { useAppSelector } from 'pl-fe/hooks';
import { makeGetStatus } from 'pl-fe/selectors';

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
      <Icon className='size-5' src={require('@tabler/icons/outline/quote.svg')} aria-hidden />
      <Text truncate>{status.url}</Text>
    </HStack>
  );
};

export { QuotedStatusIndicator as default };
