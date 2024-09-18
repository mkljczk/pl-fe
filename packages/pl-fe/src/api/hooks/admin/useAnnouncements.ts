import { useMutation, useQuery } from '@tanstack/react-query';
import {
  type AdminCreateAnnouncementParams,
  type AdminUpdateAnnouncementParams,
  type AdminAnnouncement as BaseAdminAnnouncement,
  adminAnnouncementSchema,
} from 'pl-api';

import { useClient } from 'pl-fe/hooks';
import { AdminAnnouncement, normalizeAnnouncement } from 'pl-fe/normalizers';
import { queryClient } from 'pl-fe/queries/client';

import { useAnnouncements as useUserAnnouncements } from '../announcements';

const useAnnouncements = () => {
  const client = useClient();
  const userAnnouncements = useUserAnnouncements();

  const getAnnouncements = async () => {
    const data = await client.admin.announcements.getAnnouncements();

    return data.items.map(normalizeAnnouncement<BaseAdminAnnouncement>);
  };

  const result = useQuery<ReadonlyArray<AdminAnnouncement>>({
    queryKey: ['admin', 'announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const { mutate: createAnnouncement, isPending: isCreating } = useMutation({
    mutationFn: (params: AdminCreateAnnouncementParams) =>
      client.admin.announcements.createAnnouncement(params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(
        ['admin', 'announcements'],
        (prevResult: ReadonlyArray<AdminAnnouncement>) => [
          ...prevResult,
          adminAnnouncementSchema.parse(data),
        ],
      ),
    onSettled: () => userAnnouncements.refetch(),
  });

  const { mutate: updateAnnouncement, isPending: isUpdating } = useMutation({
    mutationFn: ({
      id,
      ...params
    }: AdminUpdateAnnouncementParams & { id: string }) =>
      client.admin.announcements.updateAnnouncement(id, params),
    retry: false,
    onSuccess: (data) =>
      queryClient.setQueryData(
        ['admin', 'announcements'],
        (prevResult: ReadonlyArray<AdminAnnouncement>) =>
          prevResult.map((announcement) =>
            announcement.id === data.id
              ? adminAnnouncementSchema.parse(data)
              : announcement,
          ),
      ),
    onSettled: () => userAnnouncements.refetch(),
  });

  const { mutate: deleteAnnouncement, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) =>
      client.admin.announcements.deleteAnnouncement(id),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(
        ['admin', 'announcements'],
        (prevResult: ReadonlyArray<AdminAnnouncement>) =>
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
