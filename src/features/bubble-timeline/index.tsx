import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchBubbleTimeline } from 'soapbox/actions/timelines';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch, useSettings, useTheme } from 'soapbox/hooks';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';

import Timeline from '../ui/components/timeline';

const messages = defineMessages({
  title: { id: 'column.bubble', defaultMessage: 'Bubble timeline' },
});

const BubbleTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const settings = useSettings();
  const onlyMedia = settings.bubble.other.onlyMedia;

  const timelineId = 'bubble';
  const isMobile = useIsMobile();

  const handleLoadMore = () => {
    dispatch(fetchBubbleTimeline({ onlyMedia }, true));
  };

  const handleRefresh = () => dispatch(fetchBubbleTimeline({ onlyMedia }, true));

  useEffect(() => {
    dispatch(fetchBubbleTimeline({ onlyMedia }));
  }, [onlyMedia]);

  return (
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)} transparent={!isMobile}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-0 black:sm:p-4'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.bubble' defaultMessage='There is nothing here! Write something publicly to fill it up' />}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export { BubbleTimeline as default };
