import { createSelector } from '@reduxjs/toolkit';
import clsx from 'clsx';
import { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { type VirtuosoHandle } from 'react-virtuoso';

import { type ComposeReplyAction, mentionCompose, replyCompose } from 'soapbox/actions/compose';
import { reblog, toggleFavourite, unreblog } from 'soapbox/actions/interactions';
import { openModal } from 'soapbox/actions/modals';
import { getSettings } from 'soapbox/actions/settings';
import { toggleStatusHidden } from 'soapbox/actions/statuses';
import ScrollableList from 'soapbox/components/scrollable-list';
import StatusActionBar from 'soapbox/components/status-action-bar';
import Tombstone from 'soapbox/components/tombstone';
import { Stack } from 'soapbox/components/ui';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import { HotKeys } from 'soapbox/features/ui/components/hotkeys';
import PendingStatus from 'soapbox/features/ui/components/pending-status';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { RootState } from 'soapbox/store';
import { textForScreenReader } from 'soapbox/utils/status';

import DetailedStatus from './detailed-status';
import ThreadStatus from './thread-status';

import type { Account, Status } from 'soapbox/normalizers';
import type { SelectedStatus } from 'soapbox/selectors';

const getAncestorsIds = createSelector([
  (_: RootState, statusId: string | undefined) => statusId,
  (state: RootState) => state.contexts.inReplyTos,
], (statusId, inReplyTos) => {
  let ancestorsIds = ImmutableOrderedSet<string>();
  let id: string | undefined = statusId;

  while (id && !ancestorsIds.includes(id)) {
    ancestorsIds = ImmutableOrderedSet([id]).union(ancestorsIds);
    id = inReplyTos.get(id);
  }

  return ancestorsIds;
});

const getDescendantsIds = createSelector([
  (_: RootState, statusId: string) => statusId,
  (state: RootState) => state.contexts.replies,
], (statusId, contextReplies) => {
  let descendantsIds = ImmutableOrderedSet<string>();
  const ids = [statusId];

  while (ids.length > 0) {
    const id = ids.shift();
    if (!id) break;

    const replies = contextReplies.get(id);

    if (descendantsIds.includes(id)) {
      break;
    }

    if (statusId !== id) {
      descendantsIds = descendantsIds.union([id]);
    }

    if (replies) {
      replies.reverse().forEach((reply: string) => {
        ids.unshift(reply);
      });
    }
  }

  return descendantsIds;
});

interface IThread {
  status: SelectedStatus;
  withMedia?: boolean;
  useWindowScroll?: boolean;
  itemClassName?: string;
}

const Thread = (props: IThread) => {
  const {
    itemClassName,
    status,
    useWindowScroll = true,
    withMedia = true,
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const { ancestorsIds, descendantsIds } = useAppSelector((state) => {
    let ancestorsIds = ImmutableOrderedSet<string>();
    let descendantsIds = ImmutableOrderedSet<string>();

    if (status) {
      const statusId = status.id;
      ancestorsIds = getAncestorsIds(state, state.contexts.inReplyTos.get(statusId));
      descendantsIds = getDescendantsIds(state, statusId);
      ancestorsIds = ancestorsIds.delete(statusId).subtract(descendantsIds);
      descendantsIds = descendantsIds.delete(statusId).subtract(ancestorsIds);
    }

    return {
      status,
      ancestorsIds,
      descendantsIds,
    };
  });

  let initialTopMostItemIndex = ancestorsIds.size;
  if (!useWindowScroll && initialTopMostItemIndex !== 0) initialTopMostItemIndex = ancestorsIds.size + 1;

  const node = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<VirtuosoHandle>(null);

  const handleHotkeyReact = () => {
    if (statusRef.current) {
      const firstEmoji: HTMLButtonElement | null = statusRef.current.querySelector('.emoji-react-selector .emoji-react-selector__emoji');
      firstEmoji?.focus();
    }
  };

  const handleFavouriteClick = (status: SelectedStatus) => {
    dispatch(toggleFavourite(status));
  };

  const handleReplyClick = (status: ComposeReplyAction['status']) => dispatch(replyCompose(status));

  const handleModalReblog = (status: Pick<SelectedStatus, 'id'>) => dispatch(reblog(status));

  const handleReblogClick = (status: SelectedStatus, e?: React.MouseEvent) => {
    dispatch((_, getState) => {
      const boostModal = getSettings(getState()).get('boostModal');
      if (status.reblogged) {
        dispatch(unreblog(status));
      } else {
        if ((e && e.shiftKey) || !boostModal) {
          handleModalReblog(status);
        } else {
          dispatch(openModal('BOOST', { statusId: status.id, onReblog: handleModalReblog }));
        }
      }
    });
  };

  const handleMentionClick = (account: Pick<Account, 'acct'>) => dispatch(mentionCompose(account));

  const handleHotkeyOpenMedia = (e?: KeyboardEvent) => {
    const media = status?.media_attachments;

    e?.preventDefault();

    if (media && media.length) {
      const firstAttachment = media[0];

      if (media.length === 1 && firstAttachment.type === 'video') {
        dispatch(openModal('VIDEO', { media: firstAttachment, statusId: status.id }));
      } else {
        dispatch(openModal('MEDIA', { media, index: 0, statusId: status.id }));
      }
    }
  };

  const handleHotkeyMoveUp = () => {
    handleMoveUp(status!.id);
  };

  const handleHotkeyMoveDown = () => {
    handleMoveDown(status!.id);
  };

  const handleHotkeyReply = (e?: KeyboardEvent) => {
    e?.preventDefault();
    handleReplyClick(status!);
  };

  const handleHotkeyFavourite = () => {
    handleFavouriteClick(status!);
  };

  const handleHotkeyBoost = () => {
    handleReblogClick(status!);
  };

  const handleHotkeyMention = (e?: KeyboardEvent) => {
    e?.preventDefault();
    const { account } = status!;
    if (!account || typeof account !== 'object') return;
    handleMentionClick(account);
  };

  const handleHotkeyOpenProfile = () => {
    history.push(`/@${status!.account.acct}`);
  };

  const handleHotkeyToggleSensitive = () => {
    dispatch(toggleStatusHidden(status));
  };

  const handleMoveUp = (id: string) => {
    if (id === status?.id) {
      _selectChild(ancestorsIds.size - 1);
    } else {
      let index = ImmutableList(ancestorsIds).indexOf(id);

      if (index === -1) {
        index = ImmutableList(descendantsIds).indexOf(id);
        _selectChild(ancestorsIds.size + index);
      } else {
        _selectChild(index - 1);
      }
    }
  };

  const handleMoveDown = (id: string) => {
    if (id === status?.id) {
      _selectChild(ancestorsIds.size + 1);
    } else {
      let index = ImmutableList(ancestorsIds).indexOf(id);

      if (index === -1) {
        index = ImmutableList(descendantsIds).indexOf(id);
        _selectChild(ancestorsIds.size + index + 2);
      } else {
        _selectChild(index + 1);
      }
    }
  };

  const _selectChild = (index: number) => {
    if (!useWindowScroll) index = index + 1;
    scroller.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        node.current?.querySelector<HTMLDivElement>(`[data-index="${index}"] .focusable`)?.focus();
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
      contextType='thread'
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

  // Scroll focused status into view when thread updates.
  useEffect(() => {
    scroller.current?.scrollToIndex({
      index: ancestorsIds.size,
      offset: -146,
    });

    setTimeout(() => statusRef.current?.querySelector<HTMLDivElement>('.detailed-actualStatus')?.focus(), 0);
  }, [status.id, ancestorsIds.size]);

  const handleOpenCompareHistoryModal = (status: Pick<Status, 'id'>) => {
    dispatch(openModal('COMPARE_HISTORY', {
      statusId: status.id,
    }));
  };

  const hasAncestors = ancestorsIds.size > 0;
  const hasDescendants = descendantsIds.size > 0;

  type HotkeyHandlers = { [key: string]: (keyEvent?: KeyboardEvent) => void };

  const handlers: HotkeyHandlers = {
    moveUp: handleHotkeyMoveUp,
    moveDown: handleHotkeyMoveDown,
    reply: handleHotkeyReply,
    favourite: handleHotkeyFavourite,
    boost: handleHotkeyBoost,
    mention: handleHotkeyMention,
    openProfile: handleHotkeyOpenProfile,
    toggleSensitive: handleHotkeyToggleSensitive,
    openMedia: handleHotkeyOpenMedia,
    react: handleHotkeyReact,
  };

  const focusedStatus = (
    <div className={clsx({ 'pb-4': hasDescendants })} key={status.id}>
      <HotKeys handlers={handlers}>
        <div
          ref={statusRef}
          className='focusable relative'
          tabIndex={0}
          // FIXME: no "reblogged by" text is added for the screen reader
          aria-label={textForScreenReader(intl, status)}
        >

          <DetailedStatus
            status={status}
            withMedia={withMedia}
            onOpenCompareHistoryModal={handleOpenCompareHistoryModal}
          />

          <hr className='-mx-4 mb-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />

          <StatusActionBar
            status={status}
            expandable={false}
            space='lg'
            withLabels
          />
        </div>
      </HotKeys>

      {hasDescendants && (
        <hr className='-mx-4 mt-2 max-w-[100vw] border-t-2 black:border-t dark:border-gray-800' />
      )}
    </div>
  );

  const children: JSX.Element[] = [];

  if (!useWindowScroll) {
    // Add padding to the top of the Thread (for Media Modal)
    children.push(<div key='padding' className='h-4' />);
  }

  if (hasAncestors) {
    children.push(...renderChildren(ancestorsIds).toArray());
  }

  children.push(focusedStatus);

  if (hasDescendants) {
    children.push(...renderChildren(descendantsIds).toArray());
  }

  return (
    <Stack
      space={2}
      className={
        clsx({
          'h-full': !useWindowScroll,
          'mt-2': useWindowScroll,
        })
      }
    >
      <div
        ref={node}
        className={
          clsx('bg-white black:bg-black dark:bg-primary-900', {
            'h-full': !useWindowScroll,
          })
        }
      >
        <ScrollableList
          id='thread'
          ref={scroller}
          placeholderComponent={() => <PlaceholderStatus variant='slim' />}
          initialTopMostItemIndex={initialTopMostItemIndex}
          useWindowScroll={useWindowScroll}
          itemClassName={itemClassName}
          listClassName={
            clsx({
              'h-full': !useWindowScroll,
            })
          }
        >
          {children}
        </ScrollableList>
      </div>
    </Stack>
  );
};

export { getDescendantsIds, Thread as default };
