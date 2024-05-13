import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Column } from 'soapbox/components/ui';
import Search from 'soapbox/features/compose/components/search';
import SearchResults from 'soapbox/features/compose/components/search-results';

const messages = defineMessages({
  heading: { id: 'column.search', defaultMessage: 'Search' },
});

const SearchPage = () => {
  const intl = useIntl();

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <div className='space-y-4'>
        <Search autoFocus autoSubmit />
        <SearchResults />
      </div>
    </Column>
  );
};

export { SearchPage as default };
