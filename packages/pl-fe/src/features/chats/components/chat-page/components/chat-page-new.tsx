import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { CardTitle, HStack, IconButton, Stack } from 'pl-fe/components/ui';

import ChatSearch from '../../chat-search/chat-search';

const messages = defineMessages({
  title: { id: 'chat.new_message.title', defaultMessage: 'New Message' },
});

interface IChatPageNew {
}

/** New message form to create a chat. */
const ChatPageNew: React.FC<IChatPageNew> = () => {
  const intl = useIntl();
  const history = useHistory();

  return (
    <Stack className='h-full gap-4'>
      <Stack className='grow px-4 pt-6 sm:px-6'>
        <HStack alignItems='center'>
          <IconButton
            src={require('@tabler/icons/outline/arrow-left.svg')}
            className='mr-2 h-7 w-7 sm:mr-0 sm:hidden rtl:rotate-180'
            onClick={() => history.push('/chats')}
          />

          <CardTitle title={intl.formatMessage(messages.title)} />
        </HStack>
      </Stack>

      <ChatSearch isMainPage />
    </Stack>
  );
};

export { ChatPageNew as default };
