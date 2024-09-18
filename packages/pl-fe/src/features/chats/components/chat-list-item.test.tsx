import React from 'react';

import { render, screen } from 'pl-fe/jest/test-helpers';
import { IChat } from 'pl-fe/queries/chats';

import ChatListItem from './chat-list-item';

const chat: any = {
  id: '1',
  unread: 5,
  last_message: {
    account_id: '2',
    chat_id: '1',
    content: 'hello world',
    created_at: '2022-09-09T16:02:26.186Z',
    id: '12332423234',
    unread: true,
  },
  created_at: '2022-09-09T16:02:26.186Z',
  updated_at: '2022-09-09T16:02:26.186Z',
  accepted: true,
  account: {
    acct: 'username',
    display_name: 'johnnie',
  },
};

describe('<ChatListItem />', () => {
  it('renders correctly', () => {
    render(<ChatListItem chat={chat as IChat} onClick={vi.fn()} />);

    expect(screen.getByTestId('chat-list-item')).toBeInTheDocument();
    expect(screen.getByTestId('chat-list-item')).toHaveTextContent(
      chat.account.display_name,
    );
  });

  describe('last message content', () => {
    it('renders the last message', () => {
      render(<ChatListItem chat={chat as IChat} onClick={vi.fn()} />);

      expect(screen.getByTestId('chat-last-message')).toBeInTheDocument();
    });

    it('does not render the last message', () => {
      const changedChat = { ...chat, last_message: null };
      render(<ChatListItem chat={changedChat as IChat} onClick={vi.fn()} />);

      expect(screen.queryAllByTestId('chat-last-message')).toHaveLength(0);
    });

    describe('unread', () => {
      it('renders the unread dot', () => {
        render(<ChatListItem chat={chat as IChat} onClick={vi.fn()} />);

        expect(screen.getByTestId('chat-unread-indicator')).toBeInTheDocument();
      });

      it('does not render the unread dot', () => {
        const changedChat = {
          ...chat,
          last_message: { ...chat.last_message, unread: false },
        };
        render(<ChatListItem chat={changedChat as IChat} onClick={vi.fn()} />);

        expect(screen.queryAllByTestId('chat-unread-indicator')).toHaveLength(
          0,
        );
      });
    });
  });
});
