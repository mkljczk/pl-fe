import { getFeatures, Features } from 'soapbox/utils/features';

import { useInstance } from './useInstance';

/** Get features for the current instance. */
const useFeatures = (): Features => {
  const instance = useInstance();
  return getFeatures(instance);
};

export { useFeatures };
