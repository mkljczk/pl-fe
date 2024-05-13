import { TypedUseSelectorHook, useSelector } from 'react-redux';

import type { RootState } from 'soapbox/store';

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export { useAppSelector };
