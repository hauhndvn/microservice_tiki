import { configureStore, Reducer } from "@reduxjs/toolkit";
import cartReducer from "./reducers/cart";
import authReducer from "./reducers/auth";
 import { persistReducer, persistStore } from "redux-persist";
 import storageHau from "redux-persist/lib/storage";//đặt tên tuỳ ý
import { AuthState, CartState } from "@/dto/tikiDto";

const cartPersistConfig = {
    key: "cart",
    storage: storageHau,
  };
  
  const authPersistConfig = {
    key: "auth",
    storage: storageHau,
  };
 const persistedCartReducer = persistReducer<CartState>(//tồn tại vĩnh viễn ko mất khi refresh
    cartPersistConfig, 
    cartReducer as Reducer<CartState>);
 const persistedAuthReducer = persistReducer<AuthState>(
    authPersistConfig, 
    authReducer as Reducer<AuthState>);

export const store = configureStore({
    reducer:{
        Cart: persistedCartReducer,
        Auth: persistedAuthReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
});
export const persistorHau = persistStore(store);//đặt tên tuỳ ý
export type RootState = ReturnType<typeof store.getState>;
