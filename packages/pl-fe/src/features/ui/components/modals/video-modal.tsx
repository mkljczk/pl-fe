import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import Video from 'pl-fe/features/video';
import { useStatus } from 'pl-fe/pl-hooks/hooks/statuses/useStatus';

import type { BaseModalProps } from '../modal-root';
import type { MediaAttachment } from 'pl-api';

type VideoModalProps = {
  media: MediaAttachment;
  statusId: string;
  time?: number;
};

const VideoModal: React.FC<VideoModalProps & BaseModalProps> = ({ statusId, media, time }) => {
  const { data: status } = useStatus(statusId);

  const link = status && (
    <Link to={`/@${status.account.acct}/posts/${status.id}`}>
      <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
    </Link>
  );

  return (
    <div className='pointer-events-auto mx-auto block w-full max-w-xl overflow-hidden rounded-2xl text-left align-middle shadow-xl transition-all'>
      <Video
        preview={media.preview_url}
        blurhash={media.blurhash}
        src={media.url}
        startTime={time}
        link={link}
        detailed
        autoFocus
        alt={media.description}
        visible
      />
    </div>
  );
};

export { type VideoModalProps, VideoModal as default };
