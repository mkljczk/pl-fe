import React, { useCallback } from 'react';

import { cancelQuoteCompose } from 'pl-fe/actions/compose';
import QuotedStatus from 'pl-fe/components/quoted-status';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';
import { makeGetStatus } from 'pl-fe/selectors';

interface IQuotedStatusContainer {
  composeId: string;
}

/** QuotedStatus shown in post composer. */
const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({
  composeId,
}) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector((state) =>
    getStatus(state, { id: state.compose.get(composeId)?.quote! }),
  );

  const onCancel = () => {
    dispatch(cancelQuoteCompose(composeId));
  };

  if (!status) {
    return null;
  }

  return (
    <div className='mb-2'>
      <QuotedStatus status={status} onCancel={onCancel} compose />
    </div>
  );
};

export { QuotedStatusContainer as default };
