import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import debounce from 'lodash/debounce';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { expandStatusQuotes, fetchStatusQuotes } from 'pl-fe/actions/status-quotes';
import StatusList from 'pl-fe/components/status-list';
import { Column } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector, useTheme } from 'pl-fe/hooks';
import { useIsMobile } from 'pl-fe/hooks/useIsMobile';

const messages = defineMessages({
  heading: { id: 'column.quotes', defaultMessage: 'Post quotes' },
});

const handleLoadMore = debounce((statusId: string, dispatch: React.Dispatch<any>) =>
  dispatch(expandStatusQuotes(statusId)), 300, { leading: true });

const Quotes: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const statusIds = useAppSelector((state) => state.status_lists.getIn([`quotes:${statusId}`, 'items'], ImmutableOrderedSet<string>()));
  const isLoading = useAppSelector((state) => state.status_lists.getIn([`quotes:${statusId}`, 'isLoading'], true));
  const hasMore = useAppSelector((state) => !!state.status_lists.getIn([`quotes:${statusId}`, 'next']));

  React.useEffect(() => {
    dispatch(fetchStatusQuotes(statusId));
  }, [statusId]);

  const emptyMessage = <FormattedMessage id='empty_column.quotes' defaultMessage='This post has not been quoted yet.' />;

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent={!isMobile}>
      <StatusList
        className='black:p-0 black:sm:p-4 black:sm:pt-0'
        loadMoreClassName='black:sm:mx-4'
        statusIds={statusIds as ImmutableOrderedSet<string>}
        scrollKey={`quotes:${statusId}`}
        hasMore={hasMore}
        isLoading={typeof isLoading === 'boolean' ? isLoading : true}
        onLoadMore={() => handleLoadMore(statusId, dispatch)}
        emptyMessage={emptyMessage}
        divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
      />
    </Column>
  );
};

export { Quotes as default };
