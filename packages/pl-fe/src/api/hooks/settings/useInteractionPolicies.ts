import { useMutation, useQuery } from '@tanstack/react-query';
import { type InteractionPolicies, interactionPoliciesSchema } from 'pl-api';

import { useClient, useFeatures, useLoggedIn } from 'pl-fe/hooks';
import { queryClient } from 'pl-fe/queries/client';

const emptySchema = interactionPoliciesSchema.parse({});

const useInteractionPolicies = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();

  const { data, ...result } = useQuery({
    queryKey: ['interactionPolicies'],
    queryFn: client.settings.getInteractionPolicies,
    placeholderData: emptySchema,
    enabled: isLoggedIn && features.interactionRequests,
  });

  const { mutate: updateInteractionPolicies, isPending: isUpdating } =
    useMutation({
      mutationFn: (policy: InteractionPolicies) =>
        client.settings.updateInteractionPolicies(policy),
      retry: false,
      onSuccess: (policy) => {
        queryClient.setQueryData(['interactionPolicies'], policy);
      },
    });

  return {
    interactionPolicies: data || emptySchema,
    updateInteractionPolicies,
    isUpdating,
    ...result,
  };
};

export { useInteractionPolicies };
