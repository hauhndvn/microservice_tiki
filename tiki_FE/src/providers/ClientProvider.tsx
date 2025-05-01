// src/components/ClientProvider.tsx
'use client'; // Mark this as a Client Component

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistorHau } from '@/lib/store';
import { ReactNode } from 'react';

export default function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistorHau}>
        {children}
      </PersistGate>
    </Provider>
  );
}