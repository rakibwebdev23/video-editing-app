'use client';
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import pagesReducer from './slices/pagesSlice';
import elementsReducer from './slices/elementsSlice';
import selectionReducer from './slices/selectionSlice';
import timelineReducer from './slices/timelineSlice';
import historyReducer from './slices/historySlice';
import uiReducer from './slices/uiSlice';

import { persistenceMiddleware } from './persistenceMiddleware';

export const store = configureStore({
  reducer: {
    pages: pagesReducer,
    elements: elementsReducer,
    selection: selectionReducer,
    timeline: timelineReducer,
    history: historyReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
