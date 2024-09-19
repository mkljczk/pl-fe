/* eslint-disable react-hooks/rules-of-hooks */
import { useVirtualizer, useWindowVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import React, { useEffect, useMemo } from 'react';

import { useSettings } from 'pl-fe/hooks';

import LoadMore from './load-more';
import { Card, Spinner } from './ui';

type IScrollableListWindowScroll = {
  /** Whether to use the window to scroll the content instead of the container. */
  useWindowScroll?: true;
} | {
  /** Whether to use the window to scroll the content instead of the container. */
  useWindowScroll: false;
  parentRef: React.RefObject<HTMLElement>;
};

interface IScrollableList {
  /** Pagination callback when the end of the list is reached. */
  onLoadMore?: () => void;
  /** Whether the data is currently being fetched. */
  isLoading?: boolean;
  /** Whether to actually display the loading state. */
  showLoading?: boolean;
  /** Whether we expect an additional page of data. */
  hasMore?: boolean;
  /** Additional element to display at the top of the list. */
  prepend?: React.ReactNode;
  /** Whether to display the prepended element. */
  alwaysPrepend?: boolean;
  /** Message to display when the list is loaded but empty. */
  emptyMessage?: React.ReactNode;
  /** Should the empty message be displayed in a Card */
  emptyMessageCard?: boolean;
  /** Scrollable content. */
  children: Iterable<React.ReactNode>;
  /** Callback when the list is scrolled. */
  onScroll?: (startIndex?: number, endIndex?: number) => void;
  /** Placeholder component to render while loading. */
  placeholderComponent?: React.ComponentType | React.NamedExoticComponent;
  /** Number of placeholders to render while loading. */
  placeholderCount?: number;
  /** Extra class names on the parent element. */
  className?: string;
  /** Extra class names on the list element. */
  listClassName?: string;
  /** Class names on each item container. */
  itemClassName?: string;
  /** Extra class names on the LoadMore element */
  loadMoreClassName?: string;
  /** `id` attribute on the parent element. */
  id?: string;
  /** CSS styles on the parent element. */
  style?: React.CSSProperties;
  /** Initial item index to scroll to. */
  initialIndex?: number;
  /** Estimated size for items */
  estimatedSize?: number;
}

const ScrollableList = React.forwardRef<Virtualizer<any, any>, IScrollableList & IScrollableListWindowScroll>(({
  prepend = null,
  alwaysPrepend,
  children,
  isLoading,
  emptyMessage,
  emptyMessageCard = true,
  showLoading,
  onScroll,
  onLoadMore,
  className,
  listClassName,
  itemClassName,
  loadMoreClassName,
  id,
  hasMore,
  placeholderComponent: Placeholder,
  placeholderCount = 0,
  initialIndex = 0,
  style = {},
  estimatedSize = 300,
  ...props
}, ref) => {
  const { autoloadMore } = useSettings();

  const parentRef = React.useRef<HTMLDivElement>(null);

  /** Normalized children. */
  const elements = Array.from(children || []);

  const showPlaceholder = showLoading && Placeholder && placeholderCount > 0;

  const data = showPlaceholder ? Array(placeholderCount).fill('') : elements;

  const virtualizer = props.useWindowScroll === false ? useVirtualizer({
    count: data.length + (hasMore ? 1 : 0),
    overscan: 3,
    estimateSize: () => estimatedSize,
    getScrollElement: () => props.parentRef.current || parentRef.current,
  }) : useWindowVirtualizer({
    count: data.length + (hasMore ? 1 : 0),
    overscan: 3,
    estimateSize: () => estimatedSize,
  });

  useEffect(() => {
    if (typeof ref === 'function') ref(virtualizer); else if (ref !== null) ref.current = virtualizer;
  }, [virtualizer]);

  const range = virtualizer.calculateRange();

  useEffect(() => {
    if (showLoading) return;

    if (typeof initialIndex === 'number') virtualizer.scrollToIndex(initialIndex);
  }, [showLoading, initialIndex]);

  useEffect(() => {
    onScroll?.(range?.startIndex, range?.endIndex);
  }, [range?.startIndex, range?.endIndex]);

  useEffect(() => {
    if (onLoadMore && range?.endIndex === data.length && !showLoading && autoloadMore && hasMore) {
      onLoadMore();
    }
  }, [range?.endIndex]);

  const loadMore = useMemo(() => {
    if (autoloadMore || !hasMore || !onLoadMore) {
      return null;
    } else {
      const button = <LoadMore className='mt-4' visible={!isLoading} onClick={onLoadMore} />;

      if (loadMoreClassName) return <div className={loadMoreClassName}>{button}</div>;

      return button;
    }
  }, [autoloadMore, hasMore, isLoading]);

  /* Render an empty state instead of the scrollable list. */
  const renderEmpty = (): JSX.Element => (
    <div className='mt-2'>
      {alwaysPrepend && prepend}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {emptyMessageCard ? (
            <Card variant='rounded' size='lg'>
              {emptyMessage}
            </Card>
          ) : emptyMessage}
        </>
      )}
    </div>
  );

  const renderItem = (index: number): JSX.Element => {
    const PlaceholderComponent = Placeholder || Spinner;
    if (index === data.length) return (isLoading) ? <PlaceholderComponent /> : loadMore || <div className='h-4' />;
    if (showPlaceholder) return <PlaceholderComponent />;
    return data[index];
  };

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      id={id}
      className={clsx(className, 'w-full')}
      style={style}
    >
      <div
        className={listClassName}
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {!showLoading && data.length ? (
          <>
            {prepend}
            {virtualItems.map((item) => (
              <div
                className={item.index === data.length ? '' : itemClassName}
                key={item.key as number}
                data-index={item.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  width: '100%',
                  transform: `translateY(${item.start}px)`,
                }}
              >
                {renderItem(item.index)}
              </div>
            ))}
          </>
        ) : renderEmpty()}
      </div>
    </div>
  );
});

export { type IScrollableList, ScrollableList as default };
