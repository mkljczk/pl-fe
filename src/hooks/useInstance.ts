import { useAppSelector } from './useAppSelector';

/** Get the Instance for the current backend. */
export const useInstance = () => useAppSelector((state) => state.instance);
