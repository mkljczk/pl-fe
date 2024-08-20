import { trendsLinkSchema } from 'pl-api';

import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useClient, useFeatures } from 'soapbox/hooks';

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
