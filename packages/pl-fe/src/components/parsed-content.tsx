import parse, { Element, type HTMLReactParserOptions, domToReact, type DOMNode } from 'html-react-parser';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import HashtagLink from './hashtag-link';
import HoverRefWrapper from './hover-ref-wrapper';

import type { Mention } from 'pl-api';

const nodesToText = (nodes: Array<DOMNode>): string =>
  nodes.map(node => node.type === 'text' ? node.data : node.type === 'tag' ? nodesToText(node.children as Array<DOMNode>) : '').join('');

interface IParsedContent {
  html: string;
  mentions?: Array<Mention>;
}

const ParsedContent: React.FC<IParsedContent> = (({ html, mentions }) => {
  return useMemo(() => {
    if (html.length === 0) {
      return null;
    }

    const options: HTMLReactParserOptions = {
      replace(domNode) {
        if (domNode instanceof Element && ['script', 'iframe'].includes(domNode.name)) {
          return null;
        }

        if (domNode instanceof Element && domNode.name === 'a') {
          const classes = domNode.attribs.class?.split(' ');

          const fallback = (
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

          if (classes?.includes('mention') && mentions) {
            const mention = mentions.find(({ url }) => domNode.attribs.href === url);
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

          return fallback;
        }
      },
    };

    return parse(html, options);
  }, [html]);
});

export { ParsedContent };
