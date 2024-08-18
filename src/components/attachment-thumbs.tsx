import React, { Suspense } from 'react';

import { openModal } from 'soapbox/actions/modals';
import { MediaGallery } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch } from 'soapbox/hooks';

import type { MediaAttachment } from 'pl-api';

interface IAttachmentThumbs {
  media: Array<MediaAttachment>;
  onClick?(): void;
  sensitive?: boolean;
}

const AttachmentThumbs = (props: IAttachmentThumbs) => {
  const { media, onClick, sensitive } = props;
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
          sensitive={sensitive}
          visible
        />
      </Suspense>

      {onClick && (
        <div className='absolute inset-0 h-full w-full cursor-pointer' onClick={onClick} />
      )}
    </div>
  );
};

export { AttachmentThumbs as default };
