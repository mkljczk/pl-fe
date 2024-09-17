import React, { Suspense } from 'react';

import { openModal } from 'pl-fe/actions/modals';
import { MediaGallery } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch, useSettings } from 'pl-fe/hooks';

import { isMediaVisible } from './statuses/sensitive-content-overlay';

import type { MediaAttachment } from 'pl-api';
import type { Status } from 'pl-fe/normalizers';

interface IAttachmentThumbs {
  status: Pick<Status, 'media_attachments' | 'sensitive' | 'spoiler_text'>;
  onClick?(): void;
}

const AttachmentThumbs = ({ status, onClick }: IAttachmentThumbs) => {
  const dispatch = useAppDispatch();
  const { displayMedia } = useSettings();

  const fallback = <div className='media-gallery--compact' />;
  const onOpenMedia = (media: Array<MediaAttachment>, index: number) => dispatch(openModal('MEDIA', { media, index }));

  const visible = isMediaVisible(status, displayMedia);

  return (
    <div className='relative'>
      <Suspense fallback={fallback}>
        <MediaGallery
          media={status.media_attachments}
          onOpenMedia={onOpenMedia}
          height={50}
          compact
          visible={visible}
        />
      </Suspense>

      {onClick && (
        <div className='absolute inset-0 h-full w-full cursor-pointer' onClick={onClick} />
      )}
    </div>
  );
};

export { AttachmentThumbs as default };
