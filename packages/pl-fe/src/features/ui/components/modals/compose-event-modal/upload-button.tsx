import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { HStack, Text } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';

interface IUploadButton {
  disabled?: boolean;
  onSelectFile: (files: FileList) => void;
}

const UploadButton: React.FC<IUploadButton> = ({ disabled, onSelectFile }) => {
  const fileElement = useRef<HTMLInputElement>(null);
  const attachmentTypes = useAppSelector(state => state.instance.configuration.media_attachments.supported_mime_types)
    ?.filter((type) => type.startsWith('image/'));

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files?.length) {
      onSelectFile(e.target.files);
    }
  };

  const handleClick = () => {
    fileElement.current?.click();
  };

  return (
    <HStack className='h-full w-full cursor-pointer text-primary-500 dark:text-accent-blue' space={3} alignItems='center' justifyContent='center' element='label'>
      <Icon
        src={require('@tabler/icons/outline/photo-plus.svg')}
        className='h-7 w-7'
        onClick={handleClick}
      />

      <Text size='sm' theme='primary' weight='semibold' transform='uppercase' tabIndex={0}>
        <FormattedMessage id='compose_event.upload_banner' defaultMessage='Upload event banner' />
      </Text>
      <input
        ref={fileElement}
        type='file'
        accept={attachmentTypes?.join(',')}
        onChange={handleChange}
        disabled={disabled}
        className='hidden'
      />
    </HStack>
  );
};

export { UploadButton as default };
