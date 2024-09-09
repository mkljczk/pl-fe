import { List as ImmutableList } from 'immutable';
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'pl-fe/actions/modals';
import { fetchGroupTimeline } from 'pl-fe/actions/timelines';
import { Spinner, Text, Widget } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';
import { type AccountGalleryAttachment, getGroupGallery } from 'pl-fe/selectors';

import MediaItem from '../../../account-gallery/components/media-item';

import type { Group } from 'pl-fe/normalizers';

interface IGroupMediaPanel {
  group?: Group;
}

const GroupMediaPanel: React.FC<IGroupMediaPanel> = ({ group }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  const isMember = !!group?.relationship?.member;
  const isPrivate = group?.locked;

  const attachments: ImmutableList<AccountGalleryAttachment> = useAppSelector((state) => group ? getGroupGallery(state, group?.id) : ImmutableList());

  const handleOpenMedia = (attachment: AccountGalleryAttachment): void => {
    if (attachment.type === 'video') {
      dispatch(openModal('VIDEO', { media: attachment, statusId: attachment.status.id }));
    } else {
      const media = attachment.status.media_attachments;
      const index = media.findIndex(x => x.id === attachment.id);

      dispatch(openModal('MEDIA', { media, index, statusId: attachment.status.id }));
    }
  };

  useEffect(() => {
    setLoading(true);

    if (group && (isMember || !isPrivate)) {
      dispatch(fetchGroupTimeline(group.id, { only_media: true, limit: 40 }))
      // @ts-ignore
        .then(() => setLoading(false))
        .catch(() => {});
    }
  }, [group?.id, isMember, isPrivate]);

  const renderAttachments = () => {
    const nineAttachments = attachments.slice(0, 9);

    if (!nineAttachments.isEmpty()) {
      return (
        <div className='grid grid-cols-3 gap-1'>
          {nineAttachments.map((attachment, _index) => (
            <MediaItem
              key={`${attachment.status.id}+${attachment.id}`}
              attachment={attachment}
              onOpenMedia={handleOpenMedia}
            />
          ))}
        </div>
      );
    } else {
      return (
        <Text size='sm' theme='muted'>
          <FormattedMessage id='media_panel.empty_message' defaultMessage='No media found.' />
        </Text>
      );
    }
  };

  if (isPrivate && !isMember) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      {group && (
        <div className='w-full'>
          {loading ? (
            <Spinner />
          ) : (
            renderAttachments()
          )}
        </div>
      )}
    </Widget>
  );
};

export { GroupMediaPanel as default };
