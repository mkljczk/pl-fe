import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import Video from 'pl-fe/features/video';
import { useStatus } from 'pl-fe/pl-hooks/hooks/statuses/useStatus';

import type { BaseModalProps } from '../modal-root';
import type { MediaAttachment } from 'pl-api';
import type { Account } from 'pl-fe/normalizers';

type VideoModalProps = {
  media: MediaAttachment;
  statusId: string;
  account?: Pick<Account, 'id' | 'acct'>;
  time?: number;
};

const VideoModal: React.FC<VideoModalProps & BaseModalProps> = ({ statusId, account, media, time }) => {
  const { data: status } = useStatus(statusId);
  const history = useHistory();

  const handleStatusClick: React.MouseEventHandler = e => {
    if (!account) return;

    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      history.push(`/@${account.acct}/posts/${statusId}`);
    }
  };

  const link = status && account && (
    <a href={status.url} onClick={handleStatusClick}>
      <FormattedMessage id='lightbox.view_context' defaultMessage='View context' />
    </a>
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
