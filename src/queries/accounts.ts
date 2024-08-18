import { useMutation } from '@tanstack/react-query';

import { patchMeSuccess } from 'soapbox/actions/me';
import { useAppDispatch, useClient } from 'soapbox/hooks';
import toast from 'soapbox/toast';

type IAccount = {
  acct: string;
  avatar: string;
  avatar_static: string;
  bot: boolean;
  created_at: string;
  discoverable: boolean;
  display_name: string;
  followers_count: number;
  following_count: number;
  group: boolean;
  header: string;
  header_static: string;
  id: string;
  last_status_at: string;
  location: string;
  locked: boolean;
  note: string;
  statuses_count: number;
  url: string;
  username: string;
  verified: boolean;
}

type UpdateCredentialsData = {
  accepts_chat_messages?: boolean;
}

const useUpdateCredentials = () => {
  // const { account } = useOwnAccount();
  const client = useClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (data: UpdateCredentialsData) => client.settings.updateCredentials(data),
    // TODO: What is it intended to do?
    // onMutate(variables) {
    //   const cachedAccount = account;
    //   dispatch(patchMeSuccess({ ...account, ...variables }));

    //   return { cachedAccount };
    // },
    onSuccess(response) {
      dispatch(patchMeSuccess(response));
      toast.success('Chat Settings updated successfully');
    },
    onError(_error, _variables, context: any) {
      toast.error('Chat Settings failed to update.');
      dispatch(patchMeSuccess(context.cachedAccount));
    },
  });
};

export { type IAccount, useUpdateCredentials };