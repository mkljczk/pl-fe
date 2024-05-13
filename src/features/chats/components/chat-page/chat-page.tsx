import clsx from 'clsx';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { matchPath, Route, Switch, useHistory } from 'react-router-dom';

import { Stack } from 'soapbox/components/ui';

import ChatPageMain from './components/chat-page-main';
import ChatPageNew from './components/chat-page-new';
import ChatPageSettings from './components/chat-page-settings';
import ChatPageSidebar from './components/chat-page-sidebar';

interface IChatPage {
  chatId?: string;
}

const ChatPage: React.FC<IChatPage> = ({ chatId }) => {
  const history = useHistory();

  const path = history.location.pathname;
  const isSidebarHidden = matchPath(path, {
    path: ['/chats/settings', '/chats/new', '/chats/:chatId'],
    exact: true,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string | number>('100%');

  const calculateHeight = () => {
    if (!containerRef.current) {
      return null;
    }

    const { top } = containerRef.current.getBoundingClientRect();
    const fullHeight = document.body.offsetHeight;

    // On mobile, account for bottom navigation.
    const offset = document.body.clientWidth < 976 ? -61 : 0;

    setHeight(fullHeight - top + offset);
  };

  useLayoutEffect(() => {
    calculateHeight();
  }, [containerRef.current]);

  useEffect(() => {
    window.addEventListener('resize', calculateHeight);

    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className='h-screen overflow-hidden bg-white text-gray-900 shadow-lg black:bg-transparent sm:rounded-t-xl dark:bg-primary-900 dark:text-gray-100 dark:shadow-none'
    >
      <div
        className='grid h-full grid-cols-9 overflow-hidden black:divide-x dark:divide-x-2 dark:divide-solid dark:divide-gray-800'
        data-testid='chat-page'
      >
        <Stack
          className={clsx('dark:inset col-span-9 overflow-hidden bg-gradient-to-r from-white to-gray-100 black:bg-black sm:col-span-3 dark:bg-gray-900 dark:bg-none', {
            'hidden sm:block': isSidebarHidden,
          })}
        >
          <ChatPageSidebar />
        </Stack>

        <Stack
          className={clsx('col-span-9 h-full overflow-hidden sm:col-span-6', {
            'hidden sm:block': !isSidebarHidden,
          })}
        >
          <Switch>
            <Route path='/chats/new'>
              <ChatPageNew />
            </Route>
            <Route path='/chats/settings'>
              <ChatPageSettings />
            </Route>
            <Route>
              <ChatPageMain />
            </Route>
          </Switch>
        </Stack>
      </div>
    </div>
  );
};

export { ChatPage as default };
