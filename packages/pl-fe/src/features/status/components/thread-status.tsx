import clsx from 'clsx';
import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React from 'react';

import StatusContainer from 'pl-fe/containers/status-container';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import { useAppSelector } from 'pl-fe/hooks';

interface IThreadStatus {
  id: string;
  contextType?: string;
  focusedStatusId: string;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

/** Status with reply-connector in threads. */
const ThreadStatus: React.FC<IThreadStatus> = (props): JSX.Element => {
  const { id, focusedStatusId } = props;

  const replyToId = useAppSelector(state => state.contexts.inReplyTos.get(id));
  const replyCount = useAppSelector(state => state.contexts.replies.get(id, ImmutableOrderedSet()).size);
  const isLoaded = useAppSelector(state => Boolean(state.statuses.get(id)));

  const renderConnector = (): JSX.Element | null => {
    const isConnectedTop = replyToId && replyToId !== focusedStatusId;
    const isConnectedBottom = replyCount > 0;
    const isConnected = isConnectedTop || isConnectedBottom;

    if (!isConnected) return null;

    return (
      <div
        className={clsx('absolute left-5 z-[1] hidden w-0.5 bg-gray-200 black:bg-gray-800 dark:bg-primary-800 rtl:left-auto rtl:right-5', {
          '!block top-[calc(12px+42px)] h-[calc(100%-42px-8px-1rem)]': isConnectedBottom,
        })}
      />
    );
  };

  return (
    <div className='thread__status relative pb-4'>
      {renderConnector()}
      {isLoaded ? (
        <StatusContainer {...props} showGroup={false} />
      ) : (
        <PlaceholderStatus variant='default' />
      )}
    </div>
  );
};

export { ThreadStatus as default };
