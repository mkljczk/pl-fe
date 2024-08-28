import React from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'pl-fe/actions/modals';
import { useGroup, useGroupMedia } from 'pl-fe/api/hooks';
import LoadMore from 'pl-fe/components/load-more';
import MissingIndicator from 'pl-fe/components/missing-indicator';
import { Column, Spinner } from 'pl-fe/components/ui';
import { useAppDispatch } from 'pl-fe/hooks';

import MediaItem from '../account-gallery/components/media-item';

import type { Status } from 'pl-fe/normalizers';
import type { AccountGalleryAttachment } from 'pl-fe/selectors';

interface IGroupGallery {
  params: { groupId: string };
}

const GroupGallery: React.FC<IGroupGallery> = (props) => {
  const { groupId } = props.params;

  const dispatch = useAppDispatch();

  const { group, isLoading: groupIsLoading } = useGroup(groupId);

  const {
    entities: statuses,
    fetchNextPage,
    isLoading,
    isFetching,
    hasNextPage,
  } = useGroupMedia(groupId);

  const attachments = statuses.reduce<AccountGalleryAttachment[]>((result, status) => {
    result.push(...status.media_attachments.map((a) => ({ ...a, status: status as any, account: status.account })));
    return result;
  }, []);

  const handleOpenMedia = (attachment: AccountGalleryAttachment) => {
    if (attachment.type === 'video') {
      dispatch(openModal('VIDEO', { media: attachment, statusId: attachment.status.id, account: attachment.account }));
    } else {
      const media = (attachment.status as Status).media_attachments;
      const index = media.findIndex((x) => x.id === attachment.id);

      dispatch(openModal('MEDIA', { media, index, statusId: attachment.status.id }));
    }
  };

  if (isLoading || groupIsLoading) {
    return (
      <Column transparent withHeader={false}>
        <div className='pt-6'>
          <Spinner />
        </div>
      </Column>
    );
  }

  if (!group) {
    return (
      <div className='pt-6'>
        <MissingIndicator nested />
      </div>
    );
  }

  return (
    <Column label={group.display_name} transparent withHeader={false}>
      <div role='feed' className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {attachments.map((attachment) => (
          <MediaItem
            key={`${attachment.status.id}+${attachment.id}`}
            attachment={attachment}
            onOpenMedia={handleOpenMedia}
          />
        ))}

        {(!isLoading && attachments.length === 0) && (
          <div className='empty-column-indicator col-span-2 sm:col-span-3'>
            <FormattedMessage id='account_gallery.none' defaultMessage='No media to show.' />
          </div>
        )}
      </div>

      {hasNextPage && (
        <LoadMore className='mt-4' disabled={isFetching} onClick={fetchNextPage} />
      )}
    </Column>
  );
};

export { GroupGallery as default };
