import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CardTitle, HStack, IconButton, Stack } from 'soapbox/components/ui';
import { IChat } from 'soapbox/queries/chats';

import ChatList from '../../chat-list';

const messages = defineMessages({
  title: { id: 'column.chats', defaultMessage: 'Chats' },
});

const ChatPageSidebar = () => {
  const intl = useIntl();
  const history = useHistory();

  const handleClickChat = (chat: IChat) => {
    history.push(`/chats/${chat.id}`);
  };

  const handleChatCreate = () => {
    history.push('/chats/new');
  };

  const handleSettingsClick = () => {
    history.push('/chats/settings');
  };

  return (
    <Stack space={4} className='h-full'>
      <Stack space={4} className='px-4 pt-6'>
        <HStack alignItems='center' justifyContent='between'>
          <CardTitle title={intl.formatMessage(messages.title)} />

          <HStack space={1}>
            <IconButton
              src={require('@tabler/icons/outline/settings.svg')}
              iconClassName='h-5 w-5 text-gray-600'
              onClick={handleSettingsClick}
            />

            <IconButton
              src={require('@tabler/icons/outline/edit.svg')}
              iconClassName='h-5 w-5 text-gray-600'
              onClick={handleChatCreate}
            />
          </HStack>
        </HStack>
      </Stack>

      <Stack className='h-full grow'>
        <ChatList onClickChat={handleClickChat} />
      </Stack>
    </Stack>
  );
};

export default ChatPageSidebar;