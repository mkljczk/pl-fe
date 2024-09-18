import debounce from 'lodash/debounce';
import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import {
  expandDomainBlocks,
  fetchDomainBlocks,
} from 'pl-fe/actions/domain-blocks';
import Domain from 'pl-fe/components/domain';
import ScrollableList from 'pl-fe/components/scrollable-list';
import { Column, Spinner } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

const messages = defineMessages({
  heading: { id: 'column.domain_blocks', defaultMessage: 'Hidden domains' },
  unblockDomain: {
    id: 'account.unblock_domain',
    defaultMessage: 'Unhide {domain}',
  },
});

const handleLoadMore = debounce(
  (dispatch) => {
    dispatch(expandDomainBlocks());
  },
  300,
  { leading: true },
);

const DomainBlocks: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const domains = useAppSelector((state) => state.domain_lists.blocks.items);
  const hasMore = useAppSelector((state) => !!state.domain_lists.blocks.next);

  React.useEffect(() => {
    dispatch(fetchDomainBlocks());
  }, []);

  if (!domains) {
    return (
      <Column>
        <Spinner />
      </Column>
    );
  }

  const emptyMessage = (
    <FormattedMessage
      id='empty_column.domain_blocks'
      defaultMessage='There are no hidden domains yet.'
    />
  );

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <ScrollableList
        scrollKey='domain_blocks'
        onLoadMore={() => handleLoadMore(dispatch)}
        hasMore={hasMore}
        emptyMessage={emptyMessage}
        listClassName='divide-y divide-gray-200 dark:divide-gray-800'
      >
        {domains.map((domain) => (
          <Domain key={domain} domain={domain} />
        ))}
      </ScrollableList>
    </Column>
  );
};

export { DomainBlocks as default };
