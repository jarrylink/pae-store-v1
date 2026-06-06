'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          System Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure your store settings and preferences (Super Admin Only)
        </p>
      </div>

      {/* Coming Soon Message */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Settings Panel Coming Soon
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The system settings panel is currently under development.
            Super administrators will be able to configure store settings,
            user permissions, and system preferences from here.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="bg-[#1a2a8a] hover:bg-[#0f1a66] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/admin/users'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sections Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            General Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Site configuration, currency, and basic store settings.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user roles, permissions, and access controls.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Store Configuration
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tax rates, shipping settings, and payment methods.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Security
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Security settings, backups, and maintenance mode.
          </p>
        </div>
      </div>
    </div>
  );
}
