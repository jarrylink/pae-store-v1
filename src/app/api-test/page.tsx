'use client';

import React, { useState, useEffect } from 'react';

export default function APITestPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
      fetch('/api/admin/analytics/revenue-sales?range=30d').then(r => r.json())
    ]).then(([productsData, categoriesData, revenueData]) => {
      setProducts(productsData);
      setCategories(categoriesData.categories || []);
      setOrders(revenueData.metrics || {});
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="p-8">Loading API data...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Data Test</h1>
      
      <div className="bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold">📊 Revenue Metrics (Last 30 Days)</h2>
        <p>Revenue: ₦{orders.totalRevenue?.toLocaleString()}</p>
        <p>Orders: {orders.totalOrders}</p>
        <p>Avg Order Value: ₦{orders.avgOrderValue?.toLocaleString()}</p>
        <p>Growth: {orders.revenueGrowth?.toFixed(1)}%</p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold">📦 Products ({products.length})</h2>
        <div className="text-sm">
          {products.slice(0, 5).map((p: any) => (
            <div key={p.id}>{p.title} - ₦{p.price?.toLocaleString()}</div>
          ))}
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="font-semibold">📁 Categories ({categories.length})</h2>
        <div className="text-sm">
          {categories.map((c: any) => (
            <div key={c.id}>{c.name} {c.isActive ? '✅' : '❌'}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
