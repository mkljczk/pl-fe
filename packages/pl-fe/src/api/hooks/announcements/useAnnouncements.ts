import { useMutation, useQuery } from '@tanstack/react-query';
import { announcementReactionSchema, type AnnouncementReaction } from 'pl-api';

import { useClient } from 'pl-fe/hooks';
import { type Announcement, normalizeAnnouncement } from 'pl-fe/normalizers';
import { queryClient } from 'pl-fe/queries/client';

const updateReaction = (reaction: AnnouncementReaction, count: number, me?: boolean, overwrite?: boolean) => announcementReactionSchema.parse({
  ...reaction,
  me: typeof me === 'boolean' ? me : reaction.me,
  count: overwrite ? count : (reaction.count + count),
});

const updateReactions = (reactions: AnnouncementReaction[], name: string, count: number, me?: boolean, overwrite?: boolean) => {
  const idx = reactions.findIndex(reaction => reaction.name === name);

  if (idx > -1) {
    reactions = reactions.map(reaction => reaction.name === name ? updateReaction(reaction, count, me, overwrite) : reaction);
  }

  return [...reactions, updateReaction(announcementReactionSchema.parse({ name }), count, me, overwrite)];
};

const useAnnouncements = () => {
  const client = useClient();

  const getAnnouncements = async () => {
    const data = await client.announcements.getAnnouncements();
    return data.map(normalizeAnnouncement);
  };

  const { data, ...result } = useQuery<ReadonlyArray<Announcement>>({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const {
    mutate: addReaction,
  } = useMutation({
    mutationFn: ({ announcementId, name }: { announcementId: string; name: string }) =>
      client.announcements.addAnnouncementReaction(announcementId, name),
    retry: false,
    onMutate: ({ announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : {
          ...value,
          reactions: updateReactions(value.reactions, name, 1, true),
        }),
      );
    },
    onError: (_, { announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : {
          ...value,
          reactions: updateReactions(value.reactions, name, -1, false),
        }),
      );
    },
  });

  const {
    mutate: removeReaction,
  } = useMutation({
    mutationFn: ({ announcementId, name }: { announcementId: string; name: string }) =>
      client.announcements.deleteAnnouncementReaction(announcementId, name),
    retry: false,
    onMutate: ({ announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : {
          ...value,
          reactions: updateReactions(value.reactions, name, -1, false),
        }),
      );
    },
    onError: (_, { announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : {
          ...value,
          reactions: updateReactions(value.reactions, name, 1, true),
        }),
      );
    },
  });

  return {
    data: data ? [...data].sort(compareAnnouncements) : undefined,
    ...result,
    addReaction,
    removeReaction,
  };
};

const compareAnnouncements = (a: Announcement, b: Announcement): number =>
  new Date(a.starts_at || a.published_at).getTime() - new Date(b.starts_at || b.published_at).getTime();

export { updateReactions, useAnnouncements };
