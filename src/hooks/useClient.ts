import { getClient } from 'soapbox/api';

import { useAppSelector } from './useAppSelector';

const useClient = () => useAppSelector(getClient);

export { useClient };
