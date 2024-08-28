import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Stack } from 'soapbox/components/ui';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useChats } from 'soapbox/queries/chats';

import ChatList from '../chat-list';
import ChatSearch from '../chat-search/chat-search';
import EmptyResultsBlankslate from '../chat-search/empty-results-blankslate';
import ChatPaneHeader from '../chat-widget/chat-pane-header';
import ChatWindow from '../chat-widget/chat-window';
import ChatSearchHeader from '../chat-widget/headers/chat-search-header';
import { Pane } from '../ui';

import Blankslate from './blankslate';

import type { Chat } from 'pl-api';

const ChatPane = () => {
  const { unreadChatsCount } = useStatContext();

  const { screen, changeScreen, isOpen, toggleChatPane } = useChatContext();
  const { chatsQuery: { data: chats, isLoading } } = useChats();

  const handleClickChat = (nextChat: Chat) => {
    changeScreen(ChatWidgetScreens.CHAT, nextChat.id);
  };

  const renderBody = () => {
    if (Number(chats?.length) > 0 || isLoading) {
      return (
        <Stack space={4} className='h-full grow'>
          {(Number(chats?.length) > 0 || isLoading) ? (
            <ChatList
              onClickChat={handleClickChat}
            />
          ) : (
            <EmptyResultsBlankslate />
          )}
        </Stack>
      );
    } else if (chats?.length === 0) {
      return (
        <Blankslate
          onSearch={() => {
            changeScreen(ChatWidgetScreens.SEARCH);
          }}
        />
      );
    }
  };

  // Active chat
  if (screen === ChatWidgetScreens.CHAT || screen === ChatWidgetScreens.CHAT_SETTINGS) {
    return (
      <Pane isOpen={isOpen}>
        <ChatWindow />
      </Pane>
    );
  }

  if (screen === ChatWidgetScreens.SEARCH) {
    return (
      <Pane isOpen={isOpen}>
        <ChatSearchHeader />

        {isOpen ? <ChatSearch /> : null}
      </Pane>
    );
  }

  return (
    <Pane isOpen={isOpen}>
      <ChatPaneHeader
        title={<FormattedMessage id='column.chats' defaultMessage='Chats' />}
        unreadCount={unreadChatsCount}
        isOpen={isOpen}
        onToggle={toggleChatPane}
        secondaryAction={() => {
          changeScreen(ChatWidgetScreens.SEARCH);

          if (!isOpen) {
            toggleChatPane();
          }
        }}
        secondaryActionIcon={require('@tabler/icons/outline/edit.svg')}
      />

      {isOpen ? renderBody() : null}
    </Pane>
  );
};

export { ChatPane as default };
