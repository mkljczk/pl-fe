import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { changeSetting } from 'pl-fe/actions/settings';
import { fetchPublicTimeline } from 'pl-fe/actions/timelines';
import { usePublicStream } from 'pl-fe/api/hooks';
import PullToRefresh from 'pl-fe/components/pull-to-refresh';
import { Accordion, Column } from 'pl-fe/components/ui';
import { useAppDispatch, useInstance, useSettings, useTheme } from 'pl-fe/hooks';
import { useIsMobile } from 'pl-fe/hooks/useIsMobile';

import PinnedHostsPicker from '../remote-timeline/components/pinned-hosts-picker';
import Timeline from '../ui/components/timeline';

const messages = defineMessages({
  title: { id: 'column.public', defaultMessage: 'Fediverse timeline' },
  dismiss: { id: 'fediverse_tab.explanation_box.dismiss', defaultMessage: 'Don\'t show again' },
});

const CommunityTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const instance = useInstance();
  const settings = useSettings();
  const onlyMedia = settings.public.other.onlyMedia;

  const timelineId = 'public';
  const isMobile = useIsMobile();

  const explanationBoxExpanded = settings.explanationBox;
  const showExplanationBox = settings.showExplanationBox;

  const dismissExplanationBox = () => {
    dispatch(changeSetting(['showExplanationBox'], false));
  };

  const toggleExplanationBox = (setting: boolean) => {
    dispatch(changeSetting(['explanationBox'], setting));
  };

  const handleLoadMore = () => {
    dispatch(fetchPublicTimeline({ onlyMedia }, true));
  };

  const handleRefresh = () => dispatch(fetchPublicTimeline({ onlyMedia }));

  usePublicStream({ onlyMedia });

  useEffect(() => {
    dispatch(fetchPublicTimeline({ onlyMedia }, true));
  }, [onlyMedia]);

  return (
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)} transparent={!isMobile}>
      <PinnedHostsPicker />

      {showExplanationBox && <div className='black:mx-4 mb-4'>
        <Accordion
          headline={<FormattedMessage id='fediverse_tab.explanation_box.title' defaultMessage='What is the Fediverse?' />}
          action={dismissExplanationBox}
          actionIcon={require('@tabler/icons/outline/x.svg')}
          actionLabel={intl.formatMessage(messages.dismiss)}
          expanded={explanationBoxExpanded}
          onToggle={toggleExplanationBox}
        >
          <FormattedMessage
            id='fediverse_tab.explanation_box.explanation'
            defaultMessage={'{site_title} is part of the Fediverse, a social network made up of thousands of independent social media sites (aka "servers"). The posts you see here are from 3rd-party servers. You have the freedom to engage with them, or to block any server you don\'t like. Pay attention to the full username after the second @ symbol to know which server a post is from. To see only {site_title} posts, visit {local}.'}
            values={{
              site_title: instance.title,
              local: (
                <Link to='/timeline/local'>
                  <FormattedMessage
                    id='empty_column.home.local_tab'
                    defaultMessage='the {site_title} tab'
                    values={{ site_title: instance.title }}
                  />
                </Link>
              ),
            }}
          />
        </Accordion>
      </div>}
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-0 black:sm:p-4 black:sm:pt-0'
          loadMoreClassName='black:sm:mx-4'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.public' defaultMessage='There is nothing here! Write something publicly, or manually follow users from other servers to fill it up' />}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export { CommunityTimeline as default };
