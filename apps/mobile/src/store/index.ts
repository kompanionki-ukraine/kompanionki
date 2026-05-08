import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { api } from "../api/client";
import sessionReducer from "./sessionSlice";
import uiReducer from "./uiSlice";
import devFlagsReducer from "./devFlagsSlice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    session: sessionReducer,
    ui: uiReducer,
    devFlags: devFlagsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
        ignoredPaths: [api.reducerPath],
      },
      immutableCheck: {
        warnAfter: 128,
        ignoredPaths: [api.reducerPath],
      },
    }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
