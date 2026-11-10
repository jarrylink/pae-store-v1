'use client';

import React, { useState } from 'react';
import {
  useInvoiceDraftStore,
  InvoiceDraftItem,
  getCustomerDisplayName,
  DEFAULT_CUSTOMER_DISPLAY,
} from '@/lib/stores/invoiceDraftStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import { openPowerAfricInvoice } from '@/lib/services/invoiceTemplate';
import { searchCatalog, CatalogSearchResult } from '@/lib/ai/catalogSearch';
import { formatCurrency } from '@/utils';
import {
  Printer,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  Package,
  Wrench,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EditableInvoiceReceipt() {
  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const [copiedAccount, setCopiedAccount] = useState(false);

  const {
    invoiceNumber,
    customer,
    items,
    discount,
    notes,
    issueDate,
    dueDate,
    addItem,
    updateItem,
    removeItem,
    setCustomer,
    setDiscount,
    setNotes,
    setDates,
    clearDraft,
    calculateTotals,
  } = useInvoiceDraftStore();

  const [isSaving, setIsSaving] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [customItemForm, setCustomItemForm] = useState({
    name: '',
    type: 'product' as 'product' | 'service' | 'accessory',
    quantity: 1,
    unitPrice: 0,
    spec: '',
  });

  const totals = calculateTotals();

  // Breakdown by category
  const productsTotal = (items || [])
    .filter((i) => i.type === 'product')
    .reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  const accessoriesTotal = (items || [])
    .filter((i) => i.type === 'accessory')
    .reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  const servicesTotal = (items || [])
    .filter((i) => i.type === 'service')
    .reduce((sum, i) => sum + (i.totalPrice || 0), 0);

  const filteredCatalog = searchCatalog(catalogQuery);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('0500647850');
    setCopiedAccount(true);
    toast.success('Account number copied to clipboard');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handlePrint = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one line item to print');
      return;
    }

    const customerDisplayName = getCustomerDisplayName(customer);

    try {
      const invoiceData = {
        invoiceNumber,
        customerName: customerDisplayName,
        customerPhone: customer?.phone || '',
        customerEmail: customer?.email || '',
        customerAddress: customer?.address || '',
        deliveryAddress: customer?.address || '',
        issueDate,
        dueDate,
        items: items.map((it) => ({
          id: it.id,
          name: it.name,
          title: it.name,
          description: it.spec || it.capacity,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.totalPrice,
          type: it.type,
          spec: it.spec,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        taxRate: 0,
        taxAmount: 0,
        grandTotal: totals.grandTotal,
        total: totals.grandTotal,
        notes,
        status: 'draft',
      };

      await openPowerAfricInvoice(invoiceData);
      toast.success('Generated printable invoice preview');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to open printable invoice');
    }
  };

  const handleSaveInvoice = async () => {
    if (items.length === 0) {
      toast.error('Cannot save an empty invoice. Add items first.');
      return;
    }

    const customerDisplayName = getCustomerDisplayName(customer);

    setIsSaving(true);
    try {
      const payload = {
        type: 'invoice',
        invoiceNumber,
        customerName: customerDisplayName,
        customerEmail: customer?.email || null,
        customerPhone: customer?.phone || null,
        customerAddress: customer?.address || null,
        issueDate,
        dueDate,
        items: items.map((it) => ({
          itemId: it.id,
          description: it.name,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.totalPrice,
          type: it.type,
        })),
        discount: totals.discount,
        taxRate: 0,
        notes,
        status: 'issued',
        paymentMethod: 'Bank Transfer',
        bankName: 'GTBank Plc.',
        accountName: 'Power Afric Energy Serv. LTD',
        accountNumber: '0500647850',
        createdBy: user?.id || 'admin',
        creatorName: user ? `${user.firstName} ${user.lastName}` : 'Super Admin',
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to save invoice');
      }

      const saved = await res.json();
      toast.success(`Invoice ${saved.invoiceNumber || invoiceNumber} saved successfully!`);
      addNotification('success', `Saved invoice #${saved.invoiceNumber || invoiceNumber}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error saving invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (items.length > 0 || customer?.name) {
      if (window.confirm('Reset this invoice draft? All unsaved lines will be cleared.')) {
        clearDraft();
        toast('Invoice draft reset', { icon: '🔄' });
      }
    } else {
      clearDraft();
    }
  };

  const handleAddCatalogItem = (catItem: CatalogSearchResult) => {
    addItem({
      id: catItem.id,
      name: catItem.title,
      type: catItem.type,
      quantity: 1,
      unitPrice: catItem.price,
      spec: catItem.spec,
      capacity: catItem.capacity,
    });
    toast.success(`Added ${catItem.title}`);
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemForm.name.trim()) return;

    addItem({
      id: `custom-${Date.now()}`,
      name: customItemForm.name.trim(),
      type: customItemForm.type,
      quantity: Math.max(1, Number(customItemForm.quantity) || 1),
      unitPrice: Math.max(0, Number(customItemForm.unitPrice) || 0),
      spec: customItemForm.spec.trim(),
    });

    setCustomItemForm({
      name: '',
      type: 'product',
      quantity: 1,
      unitPrice: 0,
      spec: '',
    });
    setShowCatalogModal(false);
    toast.success('Custom item added');
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'product':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Package className="w-3 h-3" /> Product
          </span>
        );
      case 'service':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Wrench className="w-3 h-3" /> Service
          </span>
        );
      case 'accessory':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Zap className="w-3 h-3" /> Accessory
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            Item
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden transition-colors">
      {/* Streamlined Canvas Top Bar */}
      <div className="px-3.5 py-2.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Invoice
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {invoiceNumber}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            DRAFT
          </span>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pl-2 border-l border-gray-200 dark:border-gray-700">
            <span>Issue: <strong className="text-gray-700 dark:text-gray-300 font-medium">{issueDate}</strong></span>
            <span>•</span>
            <span>Due: <strong className="text-gray-700 dark:text-gray-300 font-medium">{dueDate}</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-650 transition-all shadow-sm"
            title="Reset Draft"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-650 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Print<span className="hidden sm:inline"> / PDF</span></span>
          </button>

          <button
            onClick={handleSaveInvoice}
            disabled={isSaving}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save'}<span className="hidden sm:inline"> Invoice</span></span>
          </button>
        </div>
      </div>

      {/* Main Sheet Body (Scrollable Independently) */}
      <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 space-y-4 min-h-0">
        {/* Customer & Document Information */}
        <div className="bg-gray-50/80 dark:bg-gray-750 p-3.5 rounded-lg border border-gray-200/80 dark:border-gray-700 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Customer & Billing Details
            </span>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 normal-case font-normal text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" /> Issue:
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setDates(e.target.value, dueDate)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-xs font-mono"
                />
              </span>
              <span className="flex items-center gap-1">
                Due:
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDates(issueDate, e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-xs font-mono"
                />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name <span className="text-gray-400 font-normal">({!customer?.name ? 'Walk-in Client' : 'Client'})</span>
              </label>
              <input
                type="text"
                value={customer?.name ?? ''}
                onChange={(e) => setCustomer({ name: e.target.value })}
                placeholder="Walk-in Customer / Client"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={customer?.phone ?? ''}
                onChange={(e) => setCustomer({ phone: e.target.value })}
                placeholder="0803 XXX XXXX"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customer?.email ?? ''}
                onChange={(e) => setCustomer({ email: e.target.value })}
                placeholder="client@example.com"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery / Site Address
              </label>
              <input
                type="text"
                value={customer?.address ?? ''}
                onChange={(e) => setCustomer({ address: e.target.value })}
                placeholder="Site address or location"
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Live Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>Billed Line Items</span>
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({items.length} {items.length === 1 ? 'line' : 'lines'})
              </span>
            </h3>

            <button
              onClick={() => setShowCatalogModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-gray-100/80 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item & Description</th>
                  <th className="py-2.5 px-3 w-28">Type</th>
                  <th className="py-2.5 px-3 w-24 text-center">Qty</th>
                  <th className="py-2.5 px-3 w-32 text-right">Unit Price (₦)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total (₦)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 dark:text-gray-500">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Sparkles className="w-8 h-8 text-blue-400 opacity-60" />
                        <p className="font-medium text-sm text-gray-600 dark:text-gray-400">
                          Invoice sheet is currently empty
                        </p>
                        <p className="text-xs max-w-sm">
                          Use the AI Assistant on the left to ask for solar setups, or click{' '}
                          <button
                            onClick={() => setShowCatalogModal(true)}
                            className="text-blue-600 dark:text-blue-400 underline font-semibold"
                          >
                            + Add Line Item
                          </button>{' '}
                          to manually pick from the catalog.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={`${item.id}-${index}`}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-750/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center text-gray-400 font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(index, { name: e.target.value })}
                          className="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 outline-none py-0.5"
                        />
                        {(item.spec || item.capacity) && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {item.capacity ? `${item.capacity} • ` : ''}
                            {item.spec}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3">{getTypeBadge(item.type)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, {
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-16 text-center font-medium py-1 px-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          min={0}
                          step={100}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, {
                              unitPrice: Math.max(0, parseFloat(e.target.value) || 0),
                            })
                          }
                          className="w-28 text-right font-medium py-1 px-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Summary & Bank Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {/* Left Column: Bank Details Boxed Card & Notes */}
          <div className="space-y-3">
            {/* Clean Compact Boxed Card for Settlement Account */}
            <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs border-b border-blue-200/70 dark:border-blue-900/50 pb-1.5">
                <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 text-[11px]">
                  <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Official Bank Settlement Account
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                  Bank Transfer
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 block font-semibold">Bank Name</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-xs">GTBank Plc.</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 block font-semibold">Account Number</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-blue-700 dark:text-blue-300 text-xs">
                    <span>0500647850</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-0.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Copy Account Number"
                    >
                      {copiedAccount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] uppercase text-gray-500 dark:text-gray-400 block font-semibold">Account Name</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">Power Afric Energy Serv. LTD</span>
                </div>
              </div>
            </div>

            {/* Payment & Invoice Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Payment & Invoice Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special notes, delivery instructions, or commercial terms..."
                className="w-full text-xs p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Right Column: Financial Totals Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-750 p-3.5 rounded-lg border border-gray-200/80 dark:border-gray-700 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Products Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(productsTotal)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Accessories Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(accessoriesTotal)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Services Total:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(servicesTotal)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 flex justify-between text-xs font-semibold text-gray-900 dark:text-white">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Discount (₦):</span>
                <div className="flex items-center gap-1">
                  <span>-</span>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 text-right py-0.5 px-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>VAT (0% Inclusive):</span>
                <span className="font-medium">₦0.00</span>
              </div>
            </div>

            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                Grand Total:
              </span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Custom Line Item Modal */}
      {showCatalogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-750">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Add Items to Invoice
              </h3>
              <button
                onClick={() => setShowCatalogModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Search Verified Catalog */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Search Power Afric Verified Inventory
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    value={catalogQuery}
                    onChange={(e) => setCatalogQuery(e.target.value)}
                    placeholder="Search inverters, batteries, solar panels, MC4 connectors, installation..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {filteredCatalog.slice(0, 10).map((catItem) => (
                    <div
                      key={`${catItem.type}-${catItem.id}`}
                      className="p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-xs"
                    >
                      <div className="flex-1 pr-3">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {catItem.title}
                          {getTypeBadge(catItem.type)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-[11px]">
                          {catItem.spec || catItem.category}
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(catItem.price)}
                        </span>
                        <button
                          onClick={() => handleAddCatalogItem(catItem)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Or Add Custom Line Item */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Or Enter a Custom Line Item
                </h4>
                <form onSubmit={handleAddCustomItem} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Item Title / Description"
                      required
                      value={customItemForm.name}
                      onChange={(e) =>
                        setCustomItemForm({ ...customItemForm, name: e.target.value })
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <select
                      value={customItemForm.type}
                      onChange={(e) =>
                        setCustomItemForm({
                          ...customItemForm,
                          type: e.target.value as any,
                        })
                      }
                      className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                    >
                      <option value="product">Product</option>
                      <option value="accessory">Accessory</option>
                      <option value="service">Service</option>
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Unit Price (₦)"
                      required
                      min={0}
                      value={customItemForm.unitPrice || ''}
                      onChange={(e) =>
                        setCustomItemForm({
                          ...customItemForm,
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Optional Specification (e.g. 10kW, 48V, pure copper)"
                      value={customItemForm.spec}
                      onChange={(e) =>
                        setCustomItemForm({ ...customItemForm, spec: e.target.value })
                      }
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors"
                    >
                      Add Custom
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-right">
              <button
                onClick={() => setShowCatalogModal(false)}
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs font-semibold hover:bg-gray-300 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
