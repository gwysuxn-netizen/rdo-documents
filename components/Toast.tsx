'use client';

import { Toaster } from 'react-hot-toast';

export function Toast() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
      }}
    />
  );
}
