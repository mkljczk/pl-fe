import { useMutation, useQuery } from '@tanstack/react-query';
import { useClient } from 'soapbox/hooks';

import { queryClient } from 'soapbox/queries/client';
import { domainSchema, type Domain } from 'soapbox/schemas';

interface CreateDomainParams {
  domain: string;
  public: boolean;
}

interface UpdateDomainParams {
  id: string;
  public: boolean;
}

const useDomains = () => {
  const client = useClient();

  const getDomains = async () => {
    const { json: data } = await client.request<Domain[]>('/api/v1/pleroma/admin/domains');

    const normalizedData = data.map((domain) => domainSchema.parse(domain));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<Domain>>({
    queryKey: ['admin', 'domains'],
    queryFn: getDomains,
    placeholderData: [],
  });

  const {
    mutate: createDomain,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateDomainParams) => client.request('/api/v1/pleroma/admin/domains', {
      method: 'POST', body: params,
    }),
    retry: false,
    onSuccess: ({ data }) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<Domain>) =>
        [...prevResult, domainSchema.parse(data)],
      ),
  });

  const {
    mutate: updateDomain,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateDomainParams) => client.request(`/api/v1/pleroma/admin/domains/${id}`, {
      method: 'PATCH', body: params,
    }),
    retry: false,
    onSuccess: ({ json: data }) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<Domain>) =>
        prevResult.map((domain) => domain.id === data.id ? domainSchema.parse(data) : domain),
      ),
  });

  const {
    mutate: deleteDomain,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => client.request(`/api/v1/pleroma/admin/domains/${id}`, { method: 'DELETE' }),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'domains'], (prevResult: ReadonlyArray<Domain>) =>
        prevResult.filter(({ id: domainId }) => domainId !== id),
      ),
  });

  return {
    ...result,
    createDomain,
    isCreating,
    updateDomain,
    isUpdating,
    deleteDomain,
    isDeleting,
  };
};

export { useDomains };
