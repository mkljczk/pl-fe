import { useDispatch } from 'react-redux';

import type { AppDispatch } from 'soapbox/store';

const useAppDispatch = () => useDispatch<AppDispatch>();

export { useAppDispatch };
