'use client';

import React, { useEffect, useState } from 'react';

export default function TestStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/staff');
      const data = await response.json();
      console.log('Staff API response:', data);
      if (data.success) {
        setStaff(data.staff);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch staff');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading staff...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Staff Members</h1>
      {staff.length === 0 ? (
        <p>No staff members found</p>
      ) : (
        <div className="space-y-2">
          {staff.map((s: any) => (
            <div key={s.id} className="p-4 border rounded-lg">
              <p><strong>Name:</strong> {s.name}</p>
              <p><strong>Email:</strong> {s.email}</p>
              <p><strong>Active Orders:</strong> {s.activeOrders}</p>
              <p><strong>ID:</strong> {s.id}</p>
            </div>
          ))}
        </div>
      )}
      <button 
        onClick={fetchStaff} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Refresh
      </button>
    </div>
  );
}
