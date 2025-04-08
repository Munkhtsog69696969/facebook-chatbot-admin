"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 80,
        zIndex: 99999
      }}
      toastOptions={{
        duration: 5000,
        className: 'dark:bg-gray-800 dark:text-white/90',
        style: {
          background: '#fff',
          color: '#363636',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
        // Success toast
        success: {
          iconTheme: {
            primary: '#059669',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #059669',
          }
        },
        // Error toast
        error: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #dc2626',
          }
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: '#6b7280',
            secondary: '#fff',
          },
          style: {
            border: '1px solid #6b7280',
          }
        },
      }}
    />
  );
}