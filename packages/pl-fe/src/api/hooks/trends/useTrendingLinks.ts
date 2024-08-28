import { trendsLinkSchema } from 'pl-api';

import { Entities } from 'pl-fe/entity-store/entities';
import { useEntities } from 'pl-fe/entity-store/hooks';
import { useClient, useFeatures } from 'pl-fe/hooks';

const useTrendingLinks = () => {
  const client = useClient();
  const features = useFeatures();

  const { entities, ...rest } = useEntities(
    [Entities.TRENDS_LINKS],
    () => client.trends.getTrendingLinks(),
    { schema: trendsLinkSchema, enabled: features.trendingLinks },
  );

  return { trendingLinks: entities, ...rest };
};

export { useTrendingLinks };
