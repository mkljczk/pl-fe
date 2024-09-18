import React from 'react';

import { approveUser, deleteUser } from 'pl-fe/actions/admin';
import { useAccount } from 'pl-fe/api/hooks';
import { AuthorizeRejectButtons } from 'pl-fe/components/authorize-reject-buttons';
import { HStack, Stack, Text } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';

interface IUnapprovedAccount {
  accountId: string;
}

/** Displays an unapproved account for moderation purposes. */
const UnapprovedAccount: React.FC<IUnapprovedAccount> = ({ accountId }) => {
  const dispatch = useAppDispatch();

  const { account } = useAccount(accountId);
  const adminAccount = useAppSelector((state) =>
    state.admin.users.get(accountId),
  );

  if (!account) return null;

  const handleApprove = () => dispatch(approveUser(account.id));
  const handleReject = () => dispatch(deleteUser(account.id));

  return (
    <HStack space={4} justifyContent='between'>
      <Stack space={1}>
        <Text weight='semibold'>@{account.acct}</Text>
        <Text tag='blockquote' size='sm'>
          {adminAccount?.invite_request || ''}
        </Text>
      </Stack>

      <Stack justifyContent='center'>
        <AuthorizeRejectButtons
          onAuthorize={handleApprove}
          onReject={handleReject}
          countdown={3000}
        />
      </Stack>
    </HStack>
  );
};

export { UnapprovedAccount as default };
