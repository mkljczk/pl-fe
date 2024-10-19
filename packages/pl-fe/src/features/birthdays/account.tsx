import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useAccount } from 'pl-fe/api/hooks/accounts/useAccount';
import AccountComponent from 'pl-fe/components/account';
import Icon from 'pl-fe/components/icon';
import HStack from 'pl-fe/components/ui/hstack';

const messages = defineMessages({
  birthday: { id: 'account.birthday', defaultMessage: 'Born {date}' },
});

interface IAccount {
  accountId: string;
}

const Account: React.FC<IAccount> = ({ accountId }) => {
  const intl = useIntl();
  const { account } = useAccount(accountId);

  if (!account) return null;

  const birthday = account.birthday;
  if (!birthday) return null;

  const formattedBirthday = intl.formatDate(birthday, { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <HStack space={1} alignItems='center' justifyContent='between' className='p-2.5'>
      <div className='w-full'>
        <AccountComponent account={account} withRelationship={false} />
      </div>
      <div
        className='flex items-center gap-0.5'
        title={intl.formatMessage(messages.birthday, {
          date: formattedBirthday,
        })}
      >
        <Icon src={require('@tabler/icons/outline/balloon.svg')} />
        {formattedBirthday}
      </div>
    </HStack>
  );
};

export { Account as default };
