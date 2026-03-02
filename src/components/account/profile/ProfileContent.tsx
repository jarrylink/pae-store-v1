"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

const ProfileContent: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
    expertise: [],
  });

  const handleSave = () => {
    // In a real app, this would update the user profile via API
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-slide-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal and professional information
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Personal Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white">{profileData.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email verification: <span className="text-green-500">Verified</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white">{profileData.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Professional Information</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Type
              </label>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded capitalize">
                  {user?.role}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role === 'superadmin' ? 'Super Admin' : user?.role === 'staff' ? 'Staff' : 'Customer'}
                </span>
              </div>
            </div>

            {user?.role === 'superadmin' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{profileData.company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Areas of Expertise
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.expertise.map((exp, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-medium rounded">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Account Stats */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Account Overview</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">12</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Orders</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                  <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">₦2.4M</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#1a2a8a] hover:bg-[#0f1a66] dark:bg-green-400 dark:hover:bg-green-500 text-white rounded-lg font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileContent;




