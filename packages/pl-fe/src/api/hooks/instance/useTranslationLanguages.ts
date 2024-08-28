import { useQuery } from '@tanstack/react-query';

import { useClient, useFeatures, useInstance, useLoggedIn } from 'pl-fe/hooks';

const useTranslationLanguages = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();
  const instance = useInstance();

  const getTranslationLanguages = async () => {
    const metadata = instance.pleroma.metadata;

    if (metadata.translation.source_languages?.length) {
      return Object.fromEntries(metadata.translation.source_languages.map(source => [
        source,
        metadata.translation.target_languages!.filter(lang => lang !== source),
      ]));
    }

    return client.instance.getInstanceTranslationLanguages();
  };

  const { data, ...result } = useQuery({
    queryKey: ['translationLanguages'],
    queryFn: getTranslationLanguages,
    placeholderData: {},
    enabled: isLoggedIn && features.translations,
  });

  return {
    translationLanguages: data || {},
    ...result,
  };
};

export { useTranslationLanguages };
