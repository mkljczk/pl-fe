import { Tuple, configureStore } from '@reduxjs/toolkit';
import { type ThunkDispatch, thunk } from 'redux-thunk';

import errorsMiddleware from './middleware/errors';
import soundsMiddleware from './middleware/sounds';
import appReducer from './reducers';

import type { AnyAction } from 'redux';

const store = configureStore({
  reducer: appReducer,
  middleware: () => new Tuple(thunk, errorsMiddleware(), soundsMiddleware()),
  devTools: true,
});

type Store = typeof store;

// Infer the `RootState` and `AppDispatch` types from the store itself
// https://redux.js.org/usage/usage-with-typescript
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = ThunkDispatch<RootState, {}, AnyAction>;

export { store, type Store, type RootState, type AppDispatch };
