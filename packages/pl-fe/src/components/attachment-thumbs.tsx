import React, { Suspense } from 'react';

import { MediaGallery } from 'pl-fe/features/ui/util/async-components';
import { useSettings } from 'pl-fe/hooks';
import { useModalsStore } from 'pl-fe/stores';

import { isMediaVisible } from './statuses/sensitive-content-overlay';

import type { MediaAttachment } from 'pl-api';
import type { Status } from 'pl-fe/normalizers';

interface IAttachmentThumbs {
  status: Pick<Status, 'media_attachments' | 'sensitive' | 'spoiler_text'>;
  onClick?(): void;
}

const AttachmentThumbs = ({ status, onClick }: IAttachmentThumbs) => {
  const { displayMedia } = useSettings();
  const { openModal } = useModalsStore();

  const fallback = <div className='media-gallery--compact' />;
  const onOpenMedia = (media: Array<MediaAttachment>, index: number) => openModal('MEDIA', { media, index });

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
