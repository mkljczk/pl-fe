import { getClient } from 'pl-fe/api';

import { useAppSelector } from './useAppSelector';

const useClient = () => useAppSelector(getClient);

export { useClient };
