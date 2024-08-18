import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { getTextDirection } from 'soapbox/utils/rtl';

import type { Mention as MentionEntity } from 'pl-api';
import type { Announcement } from 'soapbox/normalizers';

interface IAnnouncementContent {
  announcement: Announcement;
}

const AnnouncementContent: React.FC<IAnnouncementContent> = ({ announcement }) => {
  const history = useHistory();

  const node = useRef<HTMLDivElement>(null);
  const direction = getTextDirection(announcement.content);

  useEffect(() => {
    updateLinks();
  });

  const onMentionClick = (mention: MentionEntity, e: MouseEvent) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      history.push(`/@${mention.acct}`);
    }
  };

  const onHashtagClick = (hashtag: string, e: MouseEvent) => {
    hashtag = hashtag.replace(/^#/, '').toLowerCase();

    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      history.push(`/tags/${hashtag}`);
    }
  };

  const onStatusClick = (status: string, e: MouseEvent) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      history.push(status);
    }
  };

  const updateLinks = () => {
    if (!node.current) return;

    const links = node.current.querySelectorAll('a');

    links.forEach(link => {
      // Skip already processed
      if (link.classList.contains('status-link')) return;

      // Add attributes
      link.classList.add('status-link');
      link.setAttribute('rel', 'nofollow noopener');
      link.setAttribute('target', '_blank');

      const mention = announcement.mentions.find(mention => link.href === `${mention.url}`);

      // Add event listeners on mentions, hashtags and statuses
      if (mention) {
        link.addEventListener('click', onMentionClick.bind(link, mention), false);
        link.setAttribute('title', mention.acct);
      } else if (link.textContent?.charAt(0) === '#' || (link.previousSibling?.textContent?.charAt(link.previousSibling.textContent.length - 1) === '#')) {
        link.addEventListener('click', onHashtagClick.bind(link, link.text), false);
      } else {
        const status = announcement.statuses[link.href];
        if (status) {
          link.addEventListener('click', onStatusClick.bind(this, status), false);
        }
        link.setAttribute('title', link.href);
        link.classList.add('unhandled-link');
      }
    });
  };

  return (
    <div
      dir={direction}
      className='text-sm ltr:ml-0 rtl:mr-0'
      ref={node}
      dangerouslySetInnerHTML={{ __html: announcement.contentHtml }}
    />
  );
};

export { AnnouncementContent as default };
