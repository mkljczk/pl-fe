import { PaginationParams, WithMutedParam } from './common';

type GetChatsParams = PaginationParams & WithMutedParam;
type GetChatMessagesParams = PaginationParams;

type CreateChatMessageParams = {
  content?: string;
  media_id: string;
} | {
  content: string;
  media_id?: string;
};

export type {
  GetChatsParams,
  GetChatMessagesParams,
  CreateChatMessageParams,
};
