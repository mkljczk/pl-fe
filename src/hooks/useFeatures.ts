import { getFeatures, Features } from 'pl-api';

import { useInstance } from './useInstance';

/** Get features for the current instance. */
const useFeatures = (): Features => {
  const instance = useInstance();
  return getFeatures(instance);
};

export { useFeatures };
