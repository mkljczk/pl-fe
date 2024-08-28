import { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { eventDiscussionCompose } from 'pl-fe/actions/compose';
import { fetchStatusWithContext } from 'pl-fe/actions/statuses';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import ScrollableList from 'pl-fe/components/scrollable-list';
import Tombstone from 'pl-fe/components/tombstone';
import { Stack } from 'pl-fe/components/ui';
import PlaceholderStatus from 'pl-fe/features/placeholder/components/placeholder-status';
import PendingStatus from 'pl-fe/features/ui/components/pending-status';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';
import { makeGetStatus } from 'pl-fe/selectors';

import ComposeForm from '../compose/components/compose-form';
import { getDescendantsIds } from '../status/components/thread';
import ThreadStatus from '../status/components/thread-status';

import type { MediaAttachment } from 'pl-api';
import type { VirtuosoHandle } from 'react-virtuoso';

type RouteParams = { statusId: string };

interface IEventDiscussion {
  params: RouteParams;
  onOpenMedia: (media: Array<MediaAttachment>, index: number) => void;
  onOpenVideo: (video: MediaAttachment, time: number) => void;
}

const EventDiscussion: React.FC<IEventDiscussion> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id: props.params.statusId }));

  const me = useAppSelector((state) => state.me);

  const descendantsIds = useAppSelector(state => {
    let descendantsIds = ImmutableOrderedSet<string>();

    if (status) {
      const statusId = status.id;
      descendantsIds = getDescendantsIds(state, statusId);
      descendantsIds = descendantsIds.delete(statusId);
    }

    return descendantsIds;
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);

  const node = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle>(null);

  const fetchData = () => {
    const { params } = props;
    const { statusId } = params;
    return dispatch(fetchStatusWithContext(statusId, intl));
  };

  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [props.params.statusId]);

  useEffect(() => {
    if (isLoaded && me) dispatch(eventDiscussionCompose(`reply:${props.params.statusId}`, status!));
  }, [isLoaded, me]);

  const handleMoveUp = (id: string) => {
    const index = ImmutableList(descendantsIds).indexOf(id);
    _selectChild(index - 1);
  };

  const handleMoveDown = (id: string) => {
    const index = ImmutableList(descendantsIds).indexOf(id);
    _selectChild(index + 1);
  };

  const _selectChild = (index: number) => {
    scroller.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        const element = document.querySelector<HTMLDivElement>(`#thread [data-index="${index}"] .focusable`);

        if (element) {
          element.focus();
        }
      },
    });
  };

  const renderTombstone = (id: string) => (
    <div className='py-4 pb-8'>
      <Tombstone
        key={id}
        id={id}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
      />
    </div>
  );

  const renderStatus = (id: string) => (
    <ThreadStatus
      key={id}
      id={id}
      focusedStatusId={status!.id}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
    />
  );

  const renderPendingStatus = (id: string) => {
    const idempotencyKey = id.replace(/^末pending-/, '');

    return (
      <PendingStatus
        key={id}
        idempotencyKey={idempotencyKey}
        variant='default'
      />
    );
  };

  const renderChildren = (list: ImmutableOrderedSet<string>) => list.map(id => {
    if (id.endsWith('-tombstone')) {
      return renderTombstone(id);
    } else if (id.startsWith('末pending-')) {
      return renderPendingStatus(id);
    } else {
      return renderStatus(id);
    }
  });

  const hasDescendants = descendantsIds.size > 0;

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <PlaceholderStatus />
    );
  }

  const children: JSX.Element[] = [];

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds).toArray());
  }

  return (
    <Stack space={2}>
      {me && <div className='border-b border-solid border-gray-200 p-2 pt-0 dark:border-gray-800'>
        <ComposeForm id={`reply:${status.id}`} autoFocus={false} event={status.id} transparent />
      </div>}
      <div ref={node} className='thread p-0 shadow-none sm:p-2'>
        <ScrollableList
          id='thread'
          ref={scroller}
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          initialTopMostItemIndex={0}
          emptyMessage={<FormattedMessage id='event.discussion.empty' defaultMessage='No one has commented this event yet. When someone does, they will appear here.' />}
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export { EventDiscussion as default };
