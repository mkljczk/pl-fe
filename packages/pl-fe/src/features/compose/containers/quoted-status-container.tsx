import React from 'react';

import { cancelQuoteCompose } from 'pl-fe/actions/compose';
import QuotedStatus from 'pl-fe/components/quoted-status';
import { useAppDispatch, useCompose } from 'pl-fe/hooks';
import { useStatus } from 'pl-fe/pl-hooks/hooks/statuses/useStatus';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ composeId }) => {
  const dispatch = useAppDispatch();

  const { quote: quoteId } = useCompose(composeId);

  const { data: status } = useStatus(quoteId!);

  const onCancel = () => {
    dispatch(cancelQuoteCompose(composeId));
  };

  if (!status) {
    return null;
  }

  return (
    <div className='mb-2'>
      <QuotedStatus
        status={status}
        onCancel={onCancel}
        compose
      />
    </div>
  );
};

export { QuotedStatusContainer as default };
