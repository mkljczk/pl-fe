import React from 'react';

interface IChatsLayout {
  children: React.ReactNode;
}

/** Custom layout for chats on desktop. */
const ChatsLayout: React.FC<IChatsLayout> = ({ children }) => (
  <div className='black:border-gray-800 lg:black:border-l md:col-span-12 lg:col-span-9'>
    {children}
  </div>
);

export { ChatsLayout as default };
