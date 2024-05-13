import bookIcon from '@tabler/icons/outline/book.svg';
import fileCodeIcon from '@tabler/icons/outline/file-code.svg';
import fileSpreadsheetIcon from '@tabler/icons/outline/file-spreadsheet.svg';
import fileTextIcon from '@tabler/icons/outline/file-text.svg';
import fileZipIcon from '@tabler/icons/outline/file-zip.svg';
import defaultIcon from '@tabler/icons/outline/paperclip.svg';
import presentationIcon from '@tabler/icons/outline/presentation.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import zoomInIcon from '@tabler/icons/outline/zoom-in.svg';
import clsx from 'clsx';
import { List as ImmutableList } from 'immutable';
import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { spring } from 'react-motion';

import { openModal } from 'soapbox/actions/modals';
import Blurhash from 'soapbox/components/blurhash';
import { HStack, Icon, IconButton } from 'soapbox/components/ui';
import Motion from 'soapbox/features/ui/util/optional-motion';
import { useAppDispatch, useSettings } from 'soapbox/hooks';
import { Attachment } from 'soapbox/types/entities';

const MIMETYPE_ICONS: Record<string, string> = {
  'application/x-freearc': fileZipIcon,
  'application/x-bzip': fileZipIcon,
  'application/x-bzip2': fileZipIcon,
  'application/gzip': fileZipIcon,
  'application/vnd.rar': fileZipIcon,
  'application/x-tar': fileZipIcon,
  'application/zip': fileZipIcon,
  'application/x-7z-compressed': fileZipIcon,
  'application/x-csh': fileCodeIcon,
  'application/html': fileCodeIcon,
  'text/javascript': fileCodeIcon,
  'application/json': fileCodeIcon,
  'application/ld+json': fileCodeIcon,
  'application/x-httpd-php': fileCodeIcon,
  'application/x-sh': fileCodeIcon,
  'application/xhtml+xml': fileCodeIcon,
  'application/xml': fileCodeIcon,
  'application/epub+zip': bookIcon,
  'application/vnd.oasis.opendocument.spreadsheet': fileSpreadsheetIcon,
  'application/vnd.ms-excel': fileSpreadsheetIcon,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': fileSpreadsheetIcon,
  'application/pdf': fileTextIcon,
  'application/vnd.oasis.opendocument.presentation': presentationIcon,
  'application/vnd.ms-powerpoint': presentationIcon,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': presentationIcon,
  'text/plain': fileTextIcon,
  'application/rtf': fileTextIcon,
  'application/msword': fileTextIcon,
  'application/x-abiword': fileTextIcon,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': fileTextIcon,
  'application/vnd.oasis.opendocument.text': fileTextIcon,
};

const messages = defineMessages({
  description: { id: 'upload_form.description', defaultMessage: 'Describe for the visually impaired' },
  delete: { id: 'upload_form.undo', defaultMessage: 'Delete' },
  preview: { id: 'upload_form.preview', defaultMessage: 'Preview' },
  descriptionMissingTitle: { id: 'upload_form.description_missing.title', defaultMessage: 'This attachment doesn\'t have a description' },
});

interface IUpload extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onDragStart' | 'onDragEnter' | 'onDragEnd'> {
  media: Attachment;
  onSubmit?(): void;
  onDelete?(): void;
  onDescriptionChange?(description: string): void;
  descriptionLimit?: number;
  withPreview?: boolean;
}

const Upload: React.FC<IUpload> = ({
  media,
  onSubmit,
  onDelete,
  onDescriptionChange,
  onDragStart,
  onDragEnter,
  onDragEnd,
  descriptionLimit,
  withPreview = true,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const { missingDescriptionModal } = useSettings();

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dirtyDescription, setDirtyDescription] = useState<string | null>(null);

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    if (onSubmit && e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
      handleInputBlur();
      onSubmit();
    }
  };

  const handleUndoClick: React.MouseEventHandler = e => {
    if (onDelete) {
      e.stopPropagation();
      onDelete();
    }
  };

  const handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    setDirtyDescription(e.target.value);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleInputFocus = () => {
    setFocused(true);
  };

  const handleClick = () => {
    setFocused(true);
  };

  const handleInputBlur = () => {
    setFocused(false);
    setDirtyDescription(null);

    if (dirtyDescription !== null && onDescriptionChange) {
      onDescriptionChange(dirtyDescription);
    }
  };

  const handleOpenModal = () => {
    dispatch(openModal('MEDIA', { media: ImmutableList.of(media), index: 0 }));
  };

  const active = hovered || focused;
  const description = dirtyDescription || (dirtyDescription !== '' && media.description) || '';
  const focusX = media.meta.getIn(['focus', 'x']) as number | undefined;
  const focusY = media.meta.getIn(['focus', 'y']) as number | undefined;
  const x = focusX ? ((focusX / 2) + .5) * 100 : undefined;
  const y = focusY ? ((focusY / -2) + .5) * 100 : undefined;
  const mediaType = media.type;
  const mimeType = media.pleroma.get('mime_type') as string | undefined;

  const uploadIcon = mediaType === 'unknown' && (
    <Icon
      className='mx-auto my-12 h-16 w-16 text-gray-800 dark:text-gray-200'
      src={MIMETYPE_ICONS[mimeType || ''] || defaultIcon}
    />
  );

  return (
    <div
      className='relative m-[5px] min-w-[40%] flex-1 overflow-hidden rounded'
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      role='button'
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
    >
      <Blurhash hash={media.blurhash} className='media-gallery__preview' />
      <Motion defaultStyle={{ scale: 0.8 }} style={{ scale: spring(1, { stiffness: 180, damping: 12 }) }}>
        {({ scale }) => (
          <div
            className={clsx('compose-form__upload-thumbnail relative h-40 w-full overflow-hidden bg-contain bg-center bg-no-repeat', mediaType)}
            style={{
              transform: `scale(${scale})`,
              backgroundImage: mediaType === 'image' ? `url(${media.preview_url})` : undefined,
              backgroundPosition: typeof x === 'number' && typeof y === 'number' ? `${x}% ${y}%` : undefined,
            }}
          >
            <HStack className='absolute right-2 top-2 z-10' space={2}>
              {(withPreview && mediaType !== 'unknown' && Boolean(media.url)) && (
                <IconButton
                  onClick={handleOpenModal}
                  src={zoomInIcon}
                  theme='dark'
                  className='hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  title={intl.formatMessage(messages.preview)}
                />
              )}
              {onDelete && (
                <IconButton
                  onClick={handleUndoClick}
                  src={xIcon}
                  theme='dark'
                  className='hover:scale-105 hover:bg-gray-900'
                  iconClassName='h-5 w-5'
                  title={intl.formatMessage(messages.delete)}
                />
              )}
            </HStack>

            {onDescriptionChange && (
              <div
                className={clsx('absolute inset-x-0 bottom-0 z-[2px] bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80 p-2.5 opacity-0 transition-opacity duration-100 ease-linear', {
                  'opacity-100': active,
                })}
              >
                <label>
                  <span style={{ display: 'none' }}>{intl.formatMessage(messages.description)}</span>

                  <textarea
                    className='m-0 w-full rounded-md border border-solid border-white/25 bg-transparent p-2.5 text-sm text-white placeholder:text-white/60'
                    placeholder={intl.formatMessage(messages.description)}
                    value={description}
                    maxLength={descriptionLimit}
                    onFocus={handleInputFocus}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                  />
                </label>
              </div>
            )}

            {missingDescriptionModal && !description && (
              <span
                title={intl.formatMessage(messages.descriptionMissingTitle)}
                className={clsx('absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded bg-gray-900 px-2 py-1 text-xs font-medium uppercase text-white transition-opacity duration-100 ease-linear', {
                  'opacity-0 pointer-events-none': active,
                  'opacity-100': !active,
                })}
              >
                <Icon className='h-4 w-4' src={require('@tabler/icons/outline/alert-triangle.svg')} />
                <FormattedMessage id='upload_form.description_missing.indicator' defaultMessage='Alt' />
              </span>
            )}

            <div className='absolute inset-0 -z-[1] h-full w-full'>
              {mediaType === 'video' && (
                <video className='h-full w-full object-cover' autoPlay playsInline muted loop>
                  <source src={media.preview_url} />
                </video>
              )}
              {uploadIcon}
            </div>
          </div>
        )}
      </Motion>
    </div>
  );
};

export {
  MIMETYPE_ICONS,
  Upload as default,
};
