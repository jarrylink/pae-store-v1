'use client';

import { useEffect, useState } from 'react';

export default function CompareStaffPage() {
  const [yusufData, setYusufData] = useState<any>(null);
  const [riduwanuuData, setRiduwanuuData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBoth() {
      // Fetch Yusuf's orders (cus@powerafric.ng)
      const yusufRes = await fetch('/api/debug-staff?email=cus@powerafric.ng');
      const yusufOrders = await yusufRes.json();
      setYusufData(yusufOrders);
      
      // Fetch Riduwanuu's orders (staffone@powerafric.ng)
      const riduwanuuRes = await fetch('/api/debug-staff?email=staffone@powerafric.ng');
      const riduwanuuOrders = await riduwanuuRes.json();
      setRiduwanuuData(riduwanuuOrders);
      
      setLoading(false);
    }
    
    fetchBoth();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Staff Accounts Comparison</h1>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Yusuf Column */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Yusuf A Yusuf</h2>
          <p className="text-sm text-gray-600 mb-2">Email: cus@powerafric.ng</p>
          <p className="font-medium">Orders: {yusufData?.orders?.length || 0}</p>
          <pre className="bg-white p-3 rounded text-xs mt-2 overflow-auto max-h-96">
            {JSON.stringify(yusufData, null, 2)}
          </pre>
        </div>
        
        {/* Riduwanuu Column */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Riduwanuu Moga</h2>
          <p className="text-sm text-gray-600 mb-2">Email: staffone@powerafric.ng</p>
          <p className="font-medium">Orders: {riduwanuuData?.orders?.length || 0}</p>
          <pre className="bg-white p-3 rounded text-xs mt-2 overflow-auto max-h-96">
            {JSON.stringify(riduwanuuData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
