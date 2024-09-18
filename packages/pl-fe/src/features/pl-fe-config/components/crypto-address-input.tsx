import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { HStack, Input } from 'pl-fe/components/ui';

import type { StreamfieldComponent } from 'pl-fe/components/ui/streamfield/streamfield';
import type { CryptoAddress } from 'pl-fe/types/pl-fe';

const messages = defineMessages({
  ticker: {
    id: 'plfe_config.crypto_address.meta_fields.ticker_placeholder',
    defaultMessage: 'Ticker',
  },
  address: {
    id: 'plfe_config.crypto_address.meta_fields.address_placeholder',
    defaultMessage: 'Address',
  },
  note: {
    id: 'plfe_config.crypto_address.meta_fields.note_placeholder',
    defaultMessage: 'Note (optional)',
  },
});

const CryptoAddressInput: StreamfieldComponent<CryptoAddress> = ({
  value,
  onChange,
}) => {
  const intl = useIntl();

  const handleChange =
    (
      key: 'ticker' | 'address' | 'note',
    ): React.ChangeEventHandler<HTMLInputElement> =>
    (e) => {
      onChange(value.set(key, e.currentTarget.value));
    };

  return (
    <HStack space={2} grow>
      <Input
        type='text'
        outerClassName='w-1/6 grow'
        value={value.ticker}
        onChange={handleChange('ticker')}
        placeholder={intl.formatMessage(messages.ticker)}
      />
      <Input
        type='text'
        outerClassName='w-3/6 grow'
        value={value.address}
        onChange={handleChange('address')}
        placeholder={intl.formatMessage(messages.address)}
      />
      <Input
        type='text'
        outerClassName='w-2/6 grow'
        value={value.note}
        onChange={handleChange('note')}
        placeholder={intl.formatMessage(messages.note)}
      />
    </HStack>
  );
};

export { CryptoAddressInput as default };
