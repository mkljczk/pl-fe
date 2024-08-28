import React, { Suspense } from 'react';

import { openModal } from 'pl-fe/actions/modals';
import { MediaGallery } from 'pl-fe/features/ui/util/async-components';
import { useAppDispatch } from 'pl-fe/hooks';

import type { MediaAttachment } from 'pl-api';

interface IAttachmentThumbs {
  media: Array<MediaAttachment>;
  onClick?(): void;
  sensitive?: boolean;
}

const AttachmentThumbs = (props: IAttachmentThumbs) => {
  const { media, onClick } = props;
  const dispatch = useAppDispatch();

  const fallback = <div className='media-gallery--compact' />;
  const onOpenMedia = (media: Array<MediaAttachment>, index: number) => dispatch(openModal('MEDIA', { media, index }));

  return (
    <div className='relative'>
      <Suspense fallback={fallback}>
        <MediaGallery
          media={media}
          onOpenMedia={onOpenMedia}
          height={50}
          compact
        />
      </Suspense>

      {onClick && (
        <div className='absolute inset-0 h-full w-full cursor-pointer' onClick={onClick} />
      )}
    </div>
  );
};

export { AttachmentThumbs as default };
