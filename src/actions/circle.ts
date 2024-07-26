// Loosely adapted from twitter-interaction-circles, licensed under MIT License
// https://github.com/duiker101/twitter-interaction-circles
import api, { getNextLink } from 'soapbox/api';

import type { AppDispatch, RootState } from 'soapbox/store';
import type { APIEntity } from 'soapbox/types/entities';

interface Interaction {
  acct: string;
  avatar?: string;
  avatar_description?: string;
  replies: number;
  reblogs: number;
  favourites: number;
}

const processCircle = (setProgress: (progress: {
  state: 'pending' | 'fetchingStatuses' | 'fetchingFavourites' | 'fetchingAvatars' | 'drawing' | 'done';
  progress: number;
}) => void) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    setProgress({ state: 'pending', progress: 0 });

    const fetch = api(getState);
    const me = getState().me;

    const interactions: Record<string, Interaction> = {};

    const initInteraction = (id: string) => {
      if (interactions[id]) return;
      interactions[id] = {
        acct: '',
        replies: 0,
        reblogs: 0,
        favourites: 0,
      };
    };

    const fetchStatuses = async (url = `/api/v1/accounts/${me}/statuses?with_muted=true&limit=40`) => {
      const response = await fetch<APIEntity[]>(url);
      const next = getNextLink(response);

      response.json.forEach((status) => {
        if (status.reblog) {
          if (status.reblog.account.id === me) return;

          initInteraction(status.reblog.account.id);
          const interaction = interactions[status.reblog.account.id];

          interaction.reblogs += 1;
          interaction.acct = status.reblog.account.acct;
          interaction.avatar = status.reblog.account.avatar_static || status.reblog.account.avatar;
          interaction.avatar_description = status.reblog.account.avatar_description;
        } else if (status.in_reply_to_account_id) {
          if (status.in_reply_to_account_id === me) return;

          initInteraction(status.in_reply_to_account_id);
          const interaction = interactions[status.in_reply_to_account_id];

          interaction.replies += 1;
        }
      });

      return next;
    };

    const fetchFavourites = async (url = '/api/v1/favourites?limit=40') => {
      const response = await fetch<APIEntity[]>(url);
      const next = getNextLink(response);

      response.json.forEach((status) => {
        if (status.account.id === me) return;

        initInteraction(status.account.id);
        const interaction = interactions[status.account.id];

        interaction.favourites += 1;
        interaction.acct = status.account.acct;
        interaction.avatar = status.account.avatar_static || status.account.avatar;
        interaction.avatar_description = status.account.avatar_description;
      });

      return next;
    };

    for (let link: string | undefined, i = 0; i < 20; i++) {
      link = await fetchStatuses(link);
      setProgress({ state: 'fetchingStatuses', progress: (i / 20) * 40 });
      if (!link) break;
    }

    for (let link: string | undefined, i = 0; i < 20; i++) {
      link = await fetchFavourites(link);
      setProgress({ state: 'fetchingFavourites', progress: 40 + (i / 20) * 40 });
      if (!link) break;
    }

    const result = await Promise.all(Object.entries(interactions).map(([id, { acct, avatar, avatar_description, favourites, reblogs, replies }]) => {
      const score = favourites + replies * 1.1 + reblogs * 1.3;
      return { id, acct, avatar, avatar_description, score };
    }).toSorted((a, b) => b.score - a.score).slice(0, 49).map(async (interaction, index, array) => {
      setProgress({ state: 'fetchingAvatars', progress: 80 + (index / array.length) * 10 });

      if (interaction.acct) return interaction;

      const { json: account } = await fetch<APIEntity>(`/api/v1/accounts/${interaction.id}`);

      interaction.acct = account.acct;
      interaction.avatar = account.avatar_static || account.avatar;
      interaction.avatar_description = account.avatar_description;

      return interaction;
    }));

    return result;
  };

export {
  processCircle,
};
