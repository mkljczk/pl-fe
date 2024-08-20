import clsx from 'clsx';
import { List as ImmutableList, type OrderedSet as ImmutableOrderedSet } from 'immutable';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { expandSearch, setFilter, setSearchAccount } from 'soapbox/actions/search';
import { fetchTrendingStatuses } from 'soapbox/actions/trending-statuses';
import { useAccount, useTrendingLinks } from 'soapbox/api/hooks';
import Hashtag from 'soapbox/components/hashtag';
import IconButton from 'soapbox/components/icon-button';
import ScrollableList from 'soapbox/components/scrollable-list';
import TrendingLink from 'soapbox/components/trending-link';
import { HStack, Spinner, Tabs, Text } from 'soapbox/components/ui';
import AccountContainer from 'soapbox/containers/account-container';
import StatusContainer from 'soapbox/containers/status-container';
import PlaceholderAccount from 'soapbox/features/placeholder/components/placeholder-account';
import PlaceholderHashtag from 'soapbox/features/placeholder/components/placeholder-hashtag';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import { useAppDispatch, useAppSelector, useFeatures } from 'soapbox/hooks';

import type { VirtuosoHandle } from 'react-virtuoso';
import type { SearchFilter } from 'soapbox/reducers/search';

const messages = defineMessages({
  accounts: { id: 'search_results.accounts', defaultMessage: 'People' },
  statuses: { id: 'search_results.statuses', defaultMessage: 'Posts' },
  hashtags: { id: 'search_results.hashtags', defaultMessage: 'Hashtags' },
  links: { id: 'search_results.links', defaultMessage: 'News' },
});

const SearchResults = () => {
  const node = useRef<VirtuosoHandle>(null);

  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const [tabKey, setTabKey] = useState(1);

  const value = useAppSelector((state) => state.search.submittedValue);
  const results = useAppSelector((state) => state.search.results);
  const suggestions = useAppSelector((state) => state.suggestions.items);
  const trendingStatuses = useAppSelector((state) => state.trending_statuses.items);
  const trends = useAppSelector((state) => state.trends.items);
  const submitted = useAppSelector((state) => state.search.submitted);
  const selectedFilter = useAppSelector((state) => state.search.filter);
  const filterByAccount = useAppSelector((state) => state.search.accountId || undefined);
  const { trendingLinks } = useTrendingLinks();
  const { account } = useAccount(filterByAccount);

  const handleLoadMore = () => dispatch(expandSearch(selectedFilter));

  const handleUnsetAccount = () => dispatch(setSearchAccount(null));

  const selectFilter = (newActiveFilter: SearchFilter) => dispatch(setFilter(newActiveFilter));

  const renderFilterBar = () => {
    const items = [];
    items.push(
      {
        text: intl.formatMessage(messages.accounts),
        action: () => selectFilter('accounts'),
        name: 'accounts',
      },
      {
        text: intl.formatMessage(messages.statuses),
        action: () => selectFilter('statuses'),
        name: 'statuses',
      },
      {
        text: intl.formatMessage(messages.hashtags),
        action: () => selectFilter('hashtags'),
        name: 'hashtags',
      },
    );

    if (!submitted && features.trendingLinks) items.push({
      text: intl.formatMessage(messages.links),
      action: () => selectFilter('links'),
      name: 'links',
    });

    return <Tabs key={tabKey} items={items} activeItem={selectedFilter} />;
  };

  const getCurrentIndex = (id: string): number => resultsIds?.keySeq().findIndex(key => key === id);

  const handleMoveUp = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) - 1;
    selectChild(elementIndex);
  };

  const handleMoveDown = (id: string) => {
    if (!resultsIds) return;

    const elementIndex = getCurrentIndex(id) + 1;
    selectChild(elementIndex);
  };

  const selectChild = (index: number) => {
    node.current?.scrollIntoView({
      index,
      behavior: 'smooth',
      done: () => {
        const element = document.querySelector<HTMLDivElement>(`#search-results [data-index="${index}"] .focusable`);
        element?.focus();
      },
    });
  };

  useEffect(() => {
    dispatch(fetchTrendingStatuses());
  }, []);

  let searchResults;
  let hasMore = false;
  let loaded;
  let noResultsMessage;
  let placeholderComponent = PlaceholderStatus as React.ComponentType;
  let resultsIds: ImmutableOrderedSet<string>;

  if (selectedFilter === 'accounts') {
    hasMore = results.accountsHasMore;
    loaded = results.accountsLoaded;
    placeholderComponent = PlaceholderAccount;

    if (results.accounts && results.accounts.size > 0) {
      searchResults = results.accounts.map(accountId => <AccountContainer key={accountId} id={accountId} />);
    } else if (!submitted && suggestions && !suggestions.isEmpty()) {
      searchResults = suggestions.map(suggestion => <AccountContainer key={suggestion.account} id={suggestion.account} />);
    } else if (loaded) {
      noResultsMessage = (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.search.accounts'
            defaultMessage='There are no people results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  if (selectedFilter === 'statuses') {
    hasMore = results.statusesHasMore;
    loaded = results.statusesLoaded;

    if (results.statuses && results.statuses.size > 0) {
      searchResults = results.statuses.map((statusId: string) => (
        // @ts-ignore
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = results.statuses;
    } else if (!submitted && trendingStatuses && !trendingStatuses.isEmpty()) {
      searchResults = trendingStatuses.map((statusId: string) => (
        // @ts-ignore
        <StatusContainer
          key={statusId}
          id={statusId}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
        />
      ));
      resultsIds = trendingStatuses;
    } else if (loaded) {
      noResultsMessage = (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.search.statuses'
            defaultMessage='There are no posts results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    } else {
      noResultsMessage = <Spinner />;
    }
  }

  if (selectedFilter === 'hashtags') {
    hasMore = results.hashtagsHasMore;
    loaded = results.hashtagsLoaded;
    placeholderComponent = PlaceholderHashtag;

    if (results.hashtags && results.hashtags.size > 0) {
      searchResults = results.hashtags.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (!submitted && suggestions && !suggestions.isEmpty()) {
      searchResults = trends.map(hashtag => <Hashtag key={hashtag.name} hashtag={hashtag} />);
    } else if (loaded) {
      noResultsMessage = (
        <div className='empty-column-indicator'>
          <FormattedMessage
            id='empty_column.search.hashtags'
            defaultMessage='There are no hashtags results for "{term}"'
            values={{ term: value }}
          />
        </div>
      );
    }
  }

  if (selectedFilter === 'links') {
    if (submitted) {
      selectFilter('accounts');
      setTabKey(key => ++key);
    } else if (!submitted && trendingLinks) {
      searchResults = ImmutableList(trendingLinks.map(trendingLink => <TrendingLink trendingLink={trendingLink} />));
    }
  }

  return (
    <>
      {filterByAccount ? (
        <HStack className='mb-4 border-b border-solid border-gray-200 px-2 pb-4 dark:border-gray-800' space={2}>
          <IconButton iconClassName='h-5 w-5' src={require('@tabler/icons/outline/x.svg')} onClick={handleUnsetAccount} />
          <Text truncate>
            <FormattedMessage
              id='search_results.filter_message'
              defaultMessage='You are searching for posts from @{acct}.'
              values={{ acct: <strong className='break-words'>{account?.acct}</strong> }}
            />
          </Text>
        </HStack>
      ) : renderFilterBar()}

      {noResultsMessage || (
        <ScrollableList
          id='search-results'
          ref={node}
          key={selectedFilter}
          scrollKey={`${selectedFilter}:${value}`}
          isLoading={submitted && !loaded}
          showLoading={submitted && !loaded && searchResults?.isEmpty()}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          placeholderComponent={placeholderComponent}
          placeholderCount={20}
          listClassName={clsx({
            'divide-gray-200 dark:divide-gray-800 divide-solid divide-y': selectedFilter === 'statuses',
          })}
          itemClassName={clsx({
            'pb-4': selectedFilter === 'accounts' || selectedFilter === 'links',
            'pb-3': selectedFilter === 'hashtags',
          })}
        >
          {searchResults || []}
        </ScrollableList>
      )}
    </>
  );
};

export { SearchResults as default };
