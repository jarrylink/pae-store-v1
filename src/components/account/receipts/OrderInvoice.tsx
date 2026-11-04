'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Order } from '@/types/auth';
import { openPowerAfricInvoice } from '@/lib/services/invoiceTemplate';

interface OrderInvoiceProps {
  order: Order | any;
  onClose: () => void;
}

const OrderInvoice: React.FC<OrderInvoiceProps> = ({ order, onClose }) => {
  const hasGeneratedRef = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasGeneratedRef.current) {
      hasGeneratedRef.current = true;
      (async () => {
        try {
          await openPowerAfricInvoice(order);
        } catch (error) {
          console.error('Error generating invoice:', error);
          alert('Failed to generate invoice');
        } finally {
          setLoading(false);
          onClose();
        }
      })();
    }
  }, [order, onClose]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full text-center shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-b-2 border-[#1a2a8a] mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Generating Store Invoice</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Opening printable invoice window...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OrderInvoice;
