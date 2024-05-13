import { useFeatures } from './useFeatures';
import { useInstance } from './useInstance';

const useRegistrationStatus = () => {
  const instance = useInstance();
  const features = useFeatures();

  return {
    /** Registrations are open. */
    isOpen: features.accountCreation && instance.registrations.enabled,
  };
};

export { useRegistrationStatus };