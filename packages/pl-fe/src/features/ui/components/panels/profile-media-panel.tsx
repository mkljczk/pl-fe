import { List as ImmutableList } from 'immutable';
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { openModal } from 'pl-fe/actions/modals';
import { fetchAccountTimeline } from 'pl-fe/actions/timelines';
import { Spinner, Text, Widget } from 'pl-fe/components/ui';
import { useAppDispatch, useAppSelector } from 'pl-fe/hooks';
import { type AccountGalleryAttachment, getAccountGallery } from 'pl-fe/selectors';

import MediaItem from '../../../account-gallery/components/media-item';

import type { Account } from 'pl-fe/normalizers';

interface IProfileMediaPanel {
  account?: Account;
}

const ProfileMediaPanel: React.FC<IProfileMediaPanel> = ({ account }) => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(true);

  const attachments: ImmutableList<AccountGalleryAttachment> = useAppSelector((state) => account ? getAccountGallery(state, account?.id) : ImmutableList());

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

    if (account) {
      dispatch(fetchAccountTimeline(account.id, { only_media: true, limit: 40 }))
        // @ts-ignore yes it does
        .then(() => setLoading(false))
        .catch(() => {});
    }
  }, [account?.id]);

  const renderAttachments = () => {
    const publicAttachments = attachments.filter(attachment => attachment.status.visibility === 'public');
    const nineAttachments = publicAttachments.slice(0, 9);

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

  return (
    <Widget title={<FormattedMessage id='media_panel.title' defaultMessage='Media' />}>
      {account && (
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

export { ProfileMediaPanel as default };
