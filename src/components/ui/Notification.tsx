'use client';

import React from 'react';
import { useNotificationStore } from '@/lib/stores/notificationStore';

const icons = {
  success: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const colors = {
  success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-gray-800 dark:from-green-900/30 dark:to-emerald-900/30 dark:border-green-400 dark:text-gray-200',
  error: 'bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 text-gray-800 dark:from-red-900/30 dark:to-rose-900/30 dark:border-red-400 dark:text-gray-200',
  warning: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 text-gray-800 dark:from-yellow-900/30 dark:to-amber-900/30 dark:border-yellow-400 dark:text-gray-200',
  info: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 text-gray-800 dark:from-blue-900/30 dark:to-cyan-900/30 dark:border-blue-400 dark:text-gray-200'
};

export const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${colors[notification.type]} rounded-lg shadow-lg p-4 transform transition-all duration-500 animate-slide-in`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {icons[notification.type]}
            </div>
            <div className="flex-1">
              <p className="text-sm leading-relaxed whitespace-pre-line">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
