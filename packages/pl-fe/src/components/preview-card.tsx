import clsx from 'clsx';
import { type MediaAttachment, type PreviewCard as CardEntity, mediaAttachmentSchema } from 'pl-api';
import React, { useState, useEffect } from 'react';
import * as v from 'valibot';

import Blurhash from 'pl-fe/components/blurhash';
import { HStack, Stack, Text, Icon } from 'pl-fe/components/ui';
import { addAutoPlay } from 'pl-fe/utils/media';
import { getTextDirection } from 'pl-fe/utils/rtl';

/** Props for `PreviewCard`. */
interface IPreviewCard {
  card: CardEntity;
  maxTitle?: number;
  maxDescription?: number;
  onOpenMedia: (attachments: Array<MediaAttachment>, index: number) => void;
  compact?: boolean;
  defaultWidth?: number;
  cacheWidth?: (width: number) => void;
  horizontal?: boolean;
}

/** Displays a Mastodon link preview. Similar to OEmbed. */
const PreviewCard: React.FC<IPreviewCard> = ({
  card,
  defaultWidth = 467,
  maxTitle = 120,
  maxDescription = 200,
  compact = false,
  cacheWidth,
  onOpenMedia,
  horizontal,
}): JSX.Element => {
  const [width, setWidth] = useState(defaultWidth);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(false);
  }, [card.url]);

  const direction = getTextDirection(card.title + card.description);

  const trimmedTitle = trim(card.title, maxTitle);
  const trimmedDescription = trim(card.description, maxDescription);

  const handlePhotoClick = () => {
    const attachment = v.parse(mediaAttachmentSchema, {
      id: '',
      type: 'image',
      url: card.embed_url,
      description: trimmedTitle,
      meta: {
        original: {
          width: card.width,
          height: card.height,
        },
      },
    });

    onOpenMedia([attachment], 0);
  };

  const handleEmbedClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (card.type === 'photo') {
      handlePhotoClick();
    } else {
      setEmbedded(true);
    }
  };

  const setRef: React.RefCallback<HTMLElement> = c => {
    if (c) {
      if (cacheWidth) {
        cacheWidth(c.offsetWidth);
      }

      setWidth(c.offsetWidth);
    }
  };

  const renderVideo = () => {
    const content = { __html: addAutoPlay(card.html) };
    const ratio = getRatio(card);
    const height = width / ratio;

    return (
      <div
        ref={setRef}
        className='status-card__image status-card-video'
        dangerouslySetInnerHTML={content}
        style={{ height }}
      />
    );
  };

  const getRatio = (card: CardEntity): number => {
    const ratio = (card.width / card.height) || 16 / 9;

    // Constrain to a sane limit
    // https://en.wikipedia.org/wiki/Aspect_ratio_(image)
    return Math.min(Math.max(9 / 16, ratio), 4);
  };

  const interactive = card.type !== 'link';
  horizontal = typeof horizontal === 'boolean' ? horizontal : interactive || embedded;
  const className = clsx('status-card', { horizontal, compact, interactive }, `status-card--${card.type}`);
  const ratio = getRatio(card);
  const height = (compact && !embedded) ? (width / (16 / 9)) : (width / ratio);

  const title = interactive ? (
    <a
      onClick={(e) => e.stopPropagation()}
      href={card.url}
      title={trimmedTitle}
      rel='noopener'
      target='_blank'
      dir={direction}
    >
      <span dir={direction}>{trimmedTitle}</span>
    </a>
  ) : (
    <span title={trimmedTitle} dir={direction}>{trimmedTitle}</span>
  );

  const description = (
    <Stack space={2} className='flex-1 overflow-hidden p-4'>
      {trimmedTitle && (
        <Text weight='bold' direction={direction}>{title}</Text>
      )}
      {trimmedDescription && (
        <Text direction={direction}>{trimmedDescription}</Text>
      )}
      <HStack space={1} alignItems='center'>
        <Text tag='span' theme='muted'>
          <Icon src={require('@tabler/icons/outline/link.svg')} />
        </Text>
        <Text tag='span' theme='muted' size='sm' direction={direction}>
          {card.provider_name}
        </Text>
      </HStack>
    </Stack>
  );

  let embed: React.ReactNode = null;

  const canvas = (
    <Blurhash
      className='absolute inset-0 -z-10 size-full'
      hash={card.blurhash}
    />
  );

  const thumbnail = (
    <div
      style={{
        backgroundImage: `url(${card.image})`,
        width: horizontal ? width : undefined,
        height: horizontal ? height : undefined,
      }}
      className='status-card__image-image'
      title={card.image_description || undefined}
    />
  );

  if (interactive) {
    if (embedded) {
      embed = renderVideo();
    } else {
      let iconVariant = require('@tabler/icons/outline/player-play.svg');

      if (card.type === 'photo') {
        iconVariant = require('@tabler/icons/outline/zoom-in.svg');
      }

      embed = (
        <div className='status-card__image'>
          {canvas}
          {thumbnail}

          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='flex items-center justify-center rounded-full bg-gray-500/90 px-4 py-3 shadow-md dark:bg-gray-700/90'>
              <HStack space={3} alignItems='center'>
                <button onClick={handleEmbedClick} className='appearance-none text-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100'>
                  <Icon
                    src={iconVariant}
                    className='size-6 text-inherit'
                  />
                </button>

                {horizontal && (
                  <a
                    onClick={(e) => e.stopPropagation()}
                    href={card.url}
                    target='_blank'
                    rel='noopener'
                    className='text-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100'
                  >
                    <Icon
                      src={require('@tabler/icons/outline/external-link.svg')}
                      className='size-6 text-inherit'
                    />
                  </a>
                )}
              </HStack>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={className} ref={setRef}>
        {embed}
        {description}
      </div>
    );
  } else if (card.image) {
    embed = (
      <div className={clsx(
        'status-card__image',
        'w-full flex-none rounded-l md:size-auto md:flex-auto',
        {
          'h-auto': horizontal,
          'h-[200px]': !horizontal,
        },
      )}
      >
        {canvas}
        {thumbnail}
      </div>
    );
  }

  return (
    <a
      href={card.url}
      className={className}
      target='_blank'
      rel='noopener'
      ref={setRef}
      onClick={e => e.stopPropagation()}
    >
      {embed}
      {description}
    </a>
  );
};

/** Trim the text, adding ellipses if it's too long. */
const trim = (text: string, len: number): string => {
  const cut = text.indexOf(' ', len);

  if (cut === -1) {
    return text;
  }

  return text.substring(0, cut) + (text.length > len ? '…' : '');
};

export { PreviewCard as default };
