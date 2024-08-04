import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from 'soapbox/queries/client';
import { adminAnnouncementSchema, type AdminAnnouncement } from 'soapbox/schemas';

import { useAnnouncements as useUserAnnouncements } from '../announcements';
import { useClient } from 'soapbox/hooks';

interface CreateAnnouncementParams {
  content: string;
  starts_at?: string | null;
  ends_at?: string | null;
  all_day?: boolean;
}

interface UpdateAnnouncementParams extends CreateAnnouncementParams {
  id: string;
}

const useAnnouncements = () => {
  const client = useClient();
  const userAnnouncements = useUserAnnouncements();

  const getAnnouncements = async () => {
    const { json: data } = await client.request<AdminAnnouncement[]>('/api/v1/pleroma/admin/announcements');

    const normalizedData = data.map((announcement) => adminAnnouncementSchema.parse(announcement));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<AdminAnnouncement>>({
    queryKey: ['admin', 'announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const {
    mutate: createAnnouncement,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateAnnouncementParams) => client.request('/api/v1/pleroma/admin/announcements', {
      method: 'POST', body: params,
    }),
    retry: false,
    onSuccess: ({ json: data }) =>
      queryClient.setQueryData(['admin', 'announcements'], (prevResult: ReadonlyArray<AdminAnnouncement>) =>
        [...prevResult, adminAnnouncementSchema.parse(data)],
      ),
    onSettled: () => userAnnouncements.refetch(),
  });

  const {
    mutate: updateAnnouncement,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateAnnouncementParams) => client.request(`/api/v1/pleroma/admin/announcements/${id}`, {
      method: 'PATCH', body: params,
    }),
    retry: false,
    onSuccess: ({ json: data }) =>
      queryClient.setQueryData(['admin', 'announcements'], (prevResult: ReadonlyArray<AdminAnnouncement>) =>
        prevResult.map((announcement) => announcement.id === data.id ? adminAnnouncementSchema.parse(data) : announcement),
      ),
    onSettled: () => userAnnouncements.refetch(),
  });

  const {
    mutate: deleteAnnouncement,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => client.request(`/api/v1/pleroma/admin/announcements/${id}`, { method: 'DELETE' }),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'announcements'], (prevResult: ReadonlyArray<AdminAnnouncement>) =>
        prevResult.filter(({ id: announcementId }) => announcementId !== id),
      ),
    onSettled: () => userAnnouncements.refetch(),
  });

  return {
    ...result,
    createAnnouncement,
    isCreating,
    updateAnnouncement,
    isUpdating,
    deleteAnnouncement,
    isDeleting,
  };
};

export { useAnnouncements };
