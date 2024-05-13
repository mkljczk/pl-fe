import clsx from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchListSuggestions, clearListSuggestions, changeListSuggestions } from 'soapbox/actions/lists';
import Icon from 'soapbox/components/icon';
import { Button, Form, HStack, Input } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

const messages = defineMessages({
  search: { id: 'lists.search', defaultMessage: 'Search among people you follow' },
  searchTitle: { id: 'tabs_bar.search', defaultMessage: 'Search' },
});

const Search = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const value = useAppSelector((state) => state.listEditor.suggestions.value);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    dispatch(changeListSuggestions(e.target.value));
  };

  const handleSubmit = () => {
    dispatch(fetchListSuggestions(value));
  };

  const handleClear = () => {
    dispatch(clearListSuggestions());
  };

  const hasValue = value.length > 0;

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2}>
        <label className='relative grow'>
          <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

          <Input
            type='text'
            value={value}
            onChange={handleChange}
            placeholder={intl.formatMessage(messages.search)}
          />
          <div role='button' tabIndex={0} className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto' onClick={handleClear}>
            <Icon src={require('@tabler/icons/outline/backspace.svg')} aria-label={intl.formatMessage(messages.search)} className={clsx('h-5 w-5 text-gray-600', { hidden: !hasValue })} />
          </div>
        </label>

        <Button onClick={handleSubmit}>{intl.formatMessage(messages.searchTitle)}</Button>
      </HStack>
    </Form>
  );
};

export { Search as default };
