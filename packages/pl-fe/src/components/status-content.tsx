import clsx from 'clsx';
import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode } from 'html-react-parser';
import React, { useState, useRef, useLayoutEffect, useMemo, useEffect } from 'react';
import {  FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { collapseStatusSpoiler, expandStatusSpoiler } from 'pl-fe/actions/statuses';
import Icon from 'pl-fe/components/icon';
import { Button, Stack, Text } from 'pl-fe/components/ui';
import { useAppDispatch, useSettings } from 'pl-fe/hooks';
import { onlyEmoji as isOnlyEmoji } from 'pl-fe/utils/rich-content';

import { getTextDirection } from '../utils/rtl';

import HashtagLink from './hashtag-link';
import HoverRefWrapper from './hover-ref-wrapper';
import Markup from './markup';
import Poll from './polls/poll';

import type { Sizes } from 'pl-fe/components/ui/text/text';
import type { MinifiedStatus } from 'pl-fe/reducers/statuses';

const BIG_EMOJI_LIMIT = 10;

const nodesToText = (nodes: Array<DOMNode>): string =>
  nodes.map(node => node.type === 'text' ? node.data : node.type === 'tag' ? nodesToText(node.children as Array<DOMNode>) : '').join('');

interface IReadMoreButton {
  onClick: React.MouseEventHandler;
  quote?: boolean;
  poll?: boolean;
}

/** Button to expand a truncated status (due to too much content) */
const ReadMoreButton: React.FC<IReadMoreButton> = ({ onClick, quote, poll }) => (
  <div className='relative -mt-4'>
    <div
      className={clsx('absolute -top-16 h-16 w-full bg-gradient-to-b from-transparent', {
        'to-white black:to-black dark:to-primary-900': !poll,
        'to-gray-100 dark:to-primary-800': poll,
        'group-hover:to-gray-100 black:group-hover:to-gray-800 dark:group-hover:to-gray-800': quote,
      })}
    />
    <button className='flex items-center border-0 bg-transparent p-0 pt-2 text-gray-900 hover:underline active:underline dark:text-gray-300' onClick={onClick}>
      <FormattedMessage id='status.read_more' defaultMessage='Read more' />
      <Icon className='inline-block size-5' src={require('@tabler/icons/outline/chevron-right.svg')} />
    </button>
  </div>
);

interface IStatusContent {
  status: MinifiedStatus;
  onClick?: () => void;
  collapsable?: boolean;
  translatable?: boolean;
  textSize?: Sizes;
  quote?: boolean;
}

/** Renders the text content of a status */
const StatusContent: React.FC<IStatusContent> = React.memo(({
  status,
  onClick,
  collapsable = false,
  translatable,
  textSize = 'md',
  quote = false,
}) => {
  const dispatch = useAppDispatch();
  const { displaySpoilers } = useSettings();

  const [collapsed, setCollapsed] = useState(false);
  const [onlyEmoji, setOnlyEmoji] = useState(false);
  const [lineClamp, setLineClamp] = useState(true);

  const node = useRef<HTMLDivElement>(null);
  const spoilerNode = useRef<HTMLSpanElement>(null);

  const maybeSetCollapsed = (): void => {
    if (!node.current) return;

    if (collapsable && !collapsed) {
      // 20px * x lines (+ 2px padding at the top)
      if (node.current.clientHeight > (quote ? 202 : 282)) {
        setCollapsed(true);
      }
    }
  };

  const maybeSetOnlyEmoji = (): void => {
    if (!node.current) return;
    const only = isOnlyEmoji(node.current, BIG_EMOJI_LIMIT, true);

    if (only !== onlyEmoji) {
      setOnlyEmoji(only);
    }
  };

  const toggleExpanded: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (expanded) dispatch(collapseStatusSpoiler(status.id));
    else dispatch(expandStatusSpoiler(status.id));
  };

  useLayoutEffect(() => {
    maybeSetCollapsed();
    maybeSetOnlyEmoji();
  });

  const parsedHtml = useMemo(
    (): string => translatable && status.translation
      ? status.translation.content!
      : (status.contentMapHtml && status.currentLanguage)
        ? (status.contentMapHtml[status.currentLanguage] || status.contentHtml)
        : status.contentHtml,
    [status.contentHtml, status.translation, status.currentLanguage],
  );

  const content = useMemo(() => {
    if (status.content.length === 0) {
      return null;
    }

    const options: HTMLReactParserOptions = {
      replace(domNode) {
        if (domNode instanceof Element && ['script', 'iframe'].includes(domNode.name)) {
          return null;
        }

        if (domNode instanceof Element && domNode.name === 'a') {
          const classes = domNode.attribs.class?.split(' ');

          if (classes?.includes('mention')) {
            const mention = status.mentions.find(({ url }) => domNode.attribs.href === url);
            if (mention) {
              return (
                <HoverRefWrapper accountId={mention.id} inline>
                  <Link
                    to={`/@${mention.acct}`}
                    className='text-primary-600 hover:underline dark:text-accent-blue'
                    dir='ltr'
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{mention.username}
                  </Link>
                </HoverRefWrapper>
              );
            }
          }

          if (classes?.includes('hashtag')) {
            const hashtag = nodesToText(domNode.children as Array<DOMNode>);
            if (hashtag) {
              return <HashtagLink hashtag={hashtag.replace(/^#/, '')} />;
            }
          }

          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <a
              {...domNode.attribs}
              onClick={(e) => e.stopPropagation()}
              rel='nofollow noopener'
              target='_blank'
              title={domNode.attribs.href}
            >
              {domToReact(domNode.children as DOMNode[], options)}
            </a>
          );
        }
      },
    };

    return parse(parsedHtml, options);
  }, [parsedHtml]);

  useEffect(() => {
    setLineClamp(!spoilerNode.current || spoilerNode.current.clientHeight >= 96);
  }, [spoilerNode.current]);

  const withSpoiler = status.spoiler_text.length > 0;

  const spoilerText = status.spoilerMapHtml && status.currentLanguage
    ? status.spoilerMapHtml[status.currentLanguage] || status.spoilerHtml
    : status.spoilerHtml;

  const direction = getTextDirection(status.search_index);
  const className = clsx('relative overflow-hidden text-ellipsis break-words text-gray-900 focus:outline-none dark:text-gray-100', {
    'cursor-pointer': onClick,
    'max-h-[200px]': collapsed && !quote,
    'max-h-[120px]': collapsed && quote,
    'leading-normal big-emoji': onlyEmoji,
  });

  const expandable = !displaySpoilers;
  const expanded = !withSpoiler || status.expanded || false;

  const output = [];

  if (spoilerText) {
    output.push(
      <Text key='spoiler' size='2xl' weight='medium'>
        <span
          className={clsx({ 'line-clamp-3': !expanded && lineClamp })}
          dangerouslySetInnerHTML={{ __html: spoilerText }}
          ref={spoilerNode}
        />
        {content && expandable && (
          <Button
            className='ml-2 align-middle'
            type='button'
            theme='muted'
            size='xs'
            onClick={toggleExpanded}
            icon={expanded ? require('@tabler/icons/outline/chevron-up.svg') : require('@tabler/icons/outline/chevron-down.svg')}
          >
            {expanded
              ? <FormattedMessage id='status.spoiler.collapse' defaultMessage='Collapse' />
              : <FormattedMessage id='status.spoiler.expand' defaultMessage='Expand' />}
          </Button>
        )}
      </Text>,
    );
  }

  if (expandable && !expanded) return <>{output}</>;

  if (onClick) {
    if (content) {
      output.push(
        <Markup
          ref={node}
          tabIndex={0}
          key='content'
          className={className}
          direction={direction}
          lang={status.language || undefined}
          size={textSize}
        >
          {content}
        </Markup>,
      );
    }

    const hasPoll = !!status.poll_id;

    if (collapsed) {
      output.push(<ReadMoreButton onClick={onClick} key='read-more' quote={quote} poll={hasPoll} />);
    }

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    return <Stack space={4} className={clsx({ 'bg-gray-100 dark:bg-primary-800 rounded-md p-4': hasPoll })}>{output}</Stack>;
  } else {
    if (content) {
      output.push(
        <Markup
          ref={node}
          tabIndex={0}
          key='content'
          className={className}
          direction={direction}
          lang={status.language || undefined}
          size={textSize}
        >
          {content}
        </Markup>,
      );
    }

    if (collapsed) {
      output.push(<ReadMoreButton onClick={() => {}} key='read-more' quote={quote} />);
    }

    if (status.poll_id) {
      output.push(<Poll id={status.poll_id} key='poll' status={status} />);
    }

    return <>{output}</>;
  }
});

export { StatusContent as default };
