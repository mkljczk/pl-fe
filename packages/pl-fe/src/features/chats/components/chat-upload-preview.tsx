import React from 'react';

import Icon from 'pl-fe/components/ui/icon';
import { MIMETYPE_ICONS } from 'pl-fe/components/upload';

import type { MediaAttachment } from 'pl-api';

const defaultIcon = require('@tabler/icons/outline/paperclip.svg');

interface IChatUploadPreview {
  className?: string;
  attachment: MediaAttachment;
}

/**
 * Displays a generic preview for an upload depending on its media type.
 * It fills its container and is expected to be sized by its parent.
 */
const ChatUploadPreview: React.FC<IChatUploadPreview> = ({ className, attachment }) => {
  const mimeType = attachment.mime_type as string | undefined;

  switch (attachment.type) {
    case 'image':
    case 'gifv':
      return (
        <img
          className='pointer-events-none size-full object-cover'
          src={attachment.preview_url}
          alt=''
        />
      );
    case 'video':
      return (
        <video
          className='pointer-events-none size-full object-cover'
          src={attachment.preview_url}
          autoPlay
          playsInline
          controls={false}
          muted
          loop
        />
      );
    default:
      return (
        <div className='pointer-events-none flex size-full items-center justify-center'>
          <Icon
            className='mx-auto my-12 size-16 text-gray-800 dark:text-gray-200'
            src={MIMETYPE_ICONS[mimeType || ''] || defaultIcon}
          />
        </div>
      );
  }
};

export { ChatUploadPreview as default };
