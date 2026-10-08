'use client';
import React from 'react';
import Link from 'next/link';

export default function CategorySection() {
  const categories = [
    { name: 'Solar Panels', slug: 'solar-panels' },
    { name: 'Inverters', slug: 'inverters' },
    { name: 'Batteries', slug: 'batteries' },
    { name: 'Accessories', slug: 'accessories' },
  ];

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link key={c.slug} href={`/products?category=${c.slug}`} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium text-center hover:bg-blue-50 dark:hover:bg-gray-700 transition">
            {c.name}
          </Link>
        ))}
      </div>
    </section>
  );
}