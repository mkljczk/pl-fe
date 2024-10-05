import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'pl-fe/components/account';
import Icon from 'pl-fe/components/icon';
import { HStack, Text } from 'pl-fe/components/ui';

import type { Account as AccountEntity } from 'pl-fe/normalizers';

interface IMovedNote {
  from: AccountEntity;
  to: AccountEntity;
}

const MovedNote: React.FC<IMovedNote> = ({ from, to }) => (
  <div className='p-4'>
    <HStack className='mb-2' alignItems='center' space={1.5}>
      <Icon
        src={require('@tabler/icons/outline/briefcase.svg')}
        className='flex-none text-primary-600 dark:text-primary-400'
      />

      <div className='truncate'>
        <Text theme='muted' size='sm' truncate>
          <FormattedMessage
            id='notification.move'
            defaultMessage='{name} moved to {targetName}'
            values={{
              name: <span dangerouslySetInnerHTML={{ __html: from.display_name_html }} />,
              targetName: to.acct,
            }}
          />
        </Text>
      </div>
    </HStack>

    <Account account={to} withRelationship={false} />
  </div>
);

export { MovedNote as default };
