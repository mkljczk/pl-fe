import noop from 'lodash/noop';
import React, { Suspense } from 'react';

import { toggleStatusReport } from 'soapbox/actions/reports';
import StatusContent from 'soapbox/components/status-content';
import { Stack, Toggle } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import { MediaGallery, Video, Audio } from '../../ui/util/async-components';

interface IStatusCheckBox {
  id: string;
  disabled?: boolean;
}

const StatusCheckBox: React.FC<IStatusCheckBox> = ({ id, disabled }) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.statuses.get(id));
  const checked = useAppSelector((state) => state.reports.new.status_ids.includes(id));

  const onToggle: React.ChangeEventHandler<HTMLInputElement> = (e) => dispatch(toggleStatusReport(id, e.target.checked));

  if (!status || status.reblog) {
    return null;
  }

  let media;

  if (status.media_attachments.size > 0) {
    if (status.media_attachments.some(item => item.type === 'unknown')) {
      // Do nothing
    } else if (status.media_attachments.get(0)?.type === 'video') {
      const video = status.media_attachments.get(0);

      if (video) {
        media = (
          <Video
            preview={video.preview_url}
            blurhash={video.blurhash}
            src={video.url}
            alt={video.description}
            aspectRatio={video.meta.getIn(['original', 'aspect']) as number | undefined}
            width={239}
            height={110}
            inline
          />
        );
      }
    } else if (status.media_attachments.get(0)?.type === 'audio') {
      const audio = status.media_attachments.get(0);

      if (audio) {
        media = (
          <Audio
            src={audio.url}
            alt={audio.description}
          />
        );
      }
    } else {
      media = (
        <MediaGallery
          media={status.media_attachments}
          sensitive={status.sensitive}
          height={110}
          onOpenMedia={noop}
          visible
        />
      );
    }
  }

  return (
    <div className='flex items-center justify-between'>
      <Stack className='status-check-box__status py-2' space={1}>
        <StatusContent status={status} />
        <Suspense>{media}</Suspense>

      </Stack>

      <div className='flex items-center justify-center p-2.5'>
        <Toggle checked={checked} onChange={onToggle} disabled={disabled} />
      </div>
    </div>
  );
};

export { StatusCheckBox as default };
