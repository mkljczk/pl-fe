import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { queryClient } from 'soapbox/queries/client';
import { adminRuleSchema, type AdminRule } from 'soapbox/schemas';

interface CreateRuleParams {
  priority?: number;
  text: string;
  hint?: string;
}

interface UpdateRuleParams {
  id: string;
  priority?: number;
  text?: string;
  hint?: string;
}

const useRules = () => {
  const api = useApi();

  const getRules = async () => {
    const { json: data } = await api<AdminRule[]>('/api/v1/pleroma/admin/rules');

    const normalizedData = data.map((rule) => adminRuleSchema.parse(rule));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<AdminRule>>({
    queryKey: ['admin', 'rules'],
    queryFn: getRules,
    placeholderData: [],
  });

  const {
    mutate: createRule,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateRuleParams) => api('/api/v1/pleroma/admin/rules', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    retry: false,
    onSuccess: ({ json: data }) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
        [...prevResult, adminRuleSchema.parse(data)],
      ),
  });

  const {
    mutate: updateRule,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateRuleParams) => api(`/api/v1/pleroma/admin/rules/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(params),
    }),
    retry: false,
    onSuccess: ({ json: data }) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
        prevResult.map((rule) => rule.id === data.id ? adminRuleSchema.parse(data) : rule),
      ),
  });

  const {
    mutate: deleteRule,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => api(`/api/v1/pleroma/admin/rules/${id}`, { method: 'DELETE' }),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'rules'], (prevResult: ReadonlyArray<AdminRule>) =>
        prevResult.filter(({ id: ruleId }) => ruleId !== id),
      ),
  });

  return {
    ...result,
    createRule,
    isCreating,
    updateRule,
    isUpdating,
    deleteRule,
    isDeleting,
  };
};

export { useRules };
