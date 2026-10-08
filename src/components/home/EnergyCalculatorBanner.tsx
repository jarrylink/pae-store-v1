'use client';
import React from 'react';
import Link from 'next/link';

export default function EnergyCalculatorBanner() {
  return (
    <div className="bg-gradient-to-r from-[#1a2a8a] to-blue-700 text-white p-6 rounded-2xl my-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <div>
        <h3 className="text-xl font-bold">Not sure what capacity you need?</h3>
        <p className="text-sm text-blue-100">Calculate your power requirement in under 2 minutes.</p>
      </div>
      <Link href="/calculator" className="px-6 py-2.5 bg-white text-[#1a2a8a] rounded-xl text-sm font-semibold hover:bg-blue-50 transition shadow-sm">
        Calculate Load
      </Link>
    </div>
  );
}