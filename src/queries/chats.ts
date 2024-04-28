import { InfiniteData, keepPreviousData, useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import sumBy from 'lodash/sumBy';

import { importFetchedAccount, importFetchedAccounts } from 'soapbox/actions/importer';
import { getNextLink } from 'soapbox/api';
import { ChatWidgetScreens, useChatContext } from 'soapbox/contexts/chat-context';
import { useStatContext } from 'soapbox/contexts/stat-context';
import { useApi, useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';
import { normalizeChatMessage } from 'soapbox/normalizers';
import { ChatMessage } from 'soapbox/types/entities';
import { reOrderChatListItems } from 'soapbox/utils/chats';
import { flattenPages, PaginatedResult, updatePageItem } from 'soapbox/utils/queries';

import { queryClient } from './client';
import { useFetchRelationships } from './relationships';

import type { Account } from 'soapbox/schemas';

export interface IChat {
  account: Account;
  created_at: string;
  id: string;
  last_message: null | {
    account_id: string;
    chat_id: string;
    content: string;
    created_at: string;
    id: string;
    unread: boolean;
  };
  unread: number;
}

const ChatKeys = {
  chat: (chatId?: string) => ['chats', 'chat', chatId] as const,
  chatMessages: (chatId: string) => ['chats', 'messages', chatId] as const,
};

const useChatMessages = (chat: IChat) => {
  const api = useApi();
  const isBlocked = useAppSelector((state) => state.getIn(['relationships', chat.account.id, 'blocked_by']));

  const getChatMessages = async (chatId: string, pageParam?: any): Promise<PaginatedResult<ChatMessage>> => {
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || `/api/v1/pleroma/chats/${chatId}/messages`;
    const response = await api.get<any[]>(uri);
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;
    const result = data.map(normalizeChatMessage);

    return {
      result,
      link,
      hasMore,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ChatKeys.chatMessages(chat.id),
    queryFn: ({ pageParam }) => getChatMessages(chat.id, pageParam),
    enabled: !isBlocked,
    gcTime: 0,
    staleTime: 0,
    initialPageParam: { link: undefined as string | undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data)?.reverse();

  return {
    ...queryInfo,
    data,
  };
};

const useChats = () => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { setUnreadChatsCount } = useStatContext();
  const fetchRelationships = useFetchRelationships();

  const getChats = async (pageParam?: any): Promise<PaginatedResult<IChat>> => {
    const endpoint = features.chatsV2 ? '/api/v2/pleroma/chats' : '/api/v1/pleroma/chats';
    const nextPageLink = pageParam?.link;
    const uri = nextPageLink || endpoint;
    const response = await api.get<IChat[]>(uri);
    const { data } = response;

    const link = getNextLink(response);
    const hasMore = !!link;

    setUnreadChatsCount(Number(response.headers['x-unread-messages-count']) || sumBy(data, (chat) => chat.unread));

    // Set the relationships to these users in the redux store.
    fetchRelationships.mutate({ accountIds: data.map((item) => item.account.id) });
    dispatch(importFetchedAccounts(data.map((item) => item.account)));

    return {
      result: data,
      hasMore,
      link,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['chats', 'search'],
    queryFn: ({ pageParam }) => getChats(pageParam),
    placeholderData: keepPreviousData,
    enabled: features.chats,
    initialPageParam: { link: undefined as string | undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = flattenPages(queryInfo.data);

  const chatsQuery = {
    ...queryInfo,
    data,
  };

  const getOrCreateChatByAccountId = (accountId: string) => api.post<IChat>(`/api/v1/pleroma/chats/by-account-id/${accountId}`);

  return { chatsQuery, getOrCreateChatByAccountId };
};

const useChat = (chatId?: string) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const fetchRelationships = useFetchRelationships();

  const getChat = async () => {
    if (chatId) {
      const { data } = await api.get<IChat>(`/api/v1/pleroma/chats/${chatId}`);

      fetchRelationships.mutate({ accountIds: [data.account.id] });
      dispatch(importFetchedAccount(data.account));

      return data;
    }
  };

  return useQuery<IChat | undefined>({
    queryKey: ChatKeys.chat(chatId),
    queryFn: getChat,
    gcTime: 0,
    enabled: !!chatId,
  });
};

const useChatActions = (chatId: string) => {
  const { account } = useOwnAccount();
  const api = useApi();
  // const dispatch = useAppDispatch();

  const { setUnreadChatsCount } = useStatContext();

  const { chat, changeScreen } = useChatContext();

  const markChatAsRead = async (lastReadId: string) => {
    return api.post<IChat>(`/api/v1/pleroma/chats/${chatId}/read`, { last_read_id: lastReadId })
      .then(({ data }) => {
        updatePageItem(['chats', 'search'], data, (o, n) => o.id === n.id);
        const queryData = queryClient.getQueryData<InfiniteData<PaginatedResult<unknown>>>(['chats', 'search']);

        if (queryData) {
          const flattenedQueryData: any = flattenPages(queryData)?.map((chat: any) => {
            if (chat.id === data.id) {
              return data;
            } else {
              return chat;
            }
          });
          setUnreadChatsCount(sumBy(flattenedQueryData, (chat: IChat) => chat.unread));
        }

        return data;
      })
      .catch(() => null);
  };

  const createChatMessage = useMutation({
    mutationFn: ({ chatId, content, mediaIds }: { chatId: string; content: string; mediaIds?: string[] }) => {
      return api.post<ChatMessage>(`/api/v1/pleroma/chats/${chatId}/messages`, {
        content,
        media_id: (mediaIds && mediaIds.length === 1) ? mediaIds[0] : undefined, // Pleroma backwards-compat
        media_ids: mediaIds,
      });
    },
    retry: false,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ['chats', 'messages', variables.chatId],
      });

      // Snapshot the previous value
      const prevContent = variables.content;
      const prevChatMessages = queryClient.getQueryData(['chats', 'messages', variables.chatId]);
      const pendingId = String(Number(new Date()));

      // Optimistically update to the new value
      queryClient.setQueryData(ChatKeys.chatMessages(variables.chatId), (prevResult: any) => {
        const newResult = { ...prevResult };
        newResult.pages = newResult.pages.map((page: any, idx: number) => {
          if (idx === 0) {
            return {
              ...page,
              result: [
                normalizeChatMessage({
                  content: variables.content,
                  id: pendingId,
                  created_at: new Date(),
                  account_id: account?.id,
                  pending: true,
                  unread: true,
                }),
                ...page.result,
              ],
            };
          }

          return page;
        });

        return newResult;
      });

      return { prevChatMessages, prevContent, pendingId };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_error: any, variables, context: any) => {
      queryClient.setQueryData(['chats', 'messages', variables.chatId], context.prevChatMessages);
    },
    onSuccess: (response: any, variables, context) => {
      const nextChat = { ...chat, last_message: response.data };
      updatePageItem(['chats', 'search'], nextChat, (o, n) => o.id === n.id);
      updatePageItem(
        ChatKeys.chatMessages(variables.chatId),
        normalizeChatMessage(response.data),
        (o) => o.id === context.pendingId,
      );
      reOrderChatListItems();
    },
  });
  const deleteChatMessage = (chatMessageId: string) => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}/messages/${chatMessageId}`);

  const deleteChat = useMutation({
    mutationFn: () => api.delete<IChat>(`/api/v1/pleroma/chats/${chatId}`),
    onSuccess() {
      changeScreen(ChatWidgetScreens.INBOX);
      queryClient.invalidateQueries({ queryKey: ChatKeys.chatMessages(chatId) });
      queryClient.invalidateQueries({ queryKey: ['chats', 'search'] });
    },
  });

  return {
    createChatMessage,
    deleteChat,
    deleteChatMessage,
    markChatAsRead,
  };
};

export { ChatKeys, useChat, useChatActions, useChats, useChatMessages };
