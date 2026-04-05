'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function DebugPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [cookieData, setCookieData] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Read cookie directly
    const cookies = document.cookie.split(';');
    const userCookie = cookies.find(c => c.trim().startsWith('user_data='));
    if (userCookie) {
      try {
        const value = userCookie.split('=')[1];
        const decoded = JSON.parse(decodeURIComponent(value));
        setCookieData(decoded);
      } catch (e) {
        console.error('Error parsing cookie:', e);
      }
    }

    // Test the staff API
    fetch('/api/staff/orders')
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => console.error('API error:', err));
  }, []);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Auth Store State:</h2>
        <pre className="bg-white p-3 rounded text-sm overflow-auto">
          {JSON.stringify({ user, isAuthenticated, isLoading }, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Cookie Data (user_data):</h2>
        <pre className="bg-white p-3 rounded text-sm overflow-auto">
          {JSON.stringify(cookieData, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Staff API Response:</h2>
        <pre className="bg-white p-3 rounded text-sm overflow-auto">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Current URL:</h2>
        <p className="bg-white p-3 rounded text-sm">{window.location.href}</p>
      </div>
    </div>
  );
}
