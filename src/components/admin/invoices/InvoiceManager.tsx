'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Invoice, InvoiceItem } from '@/types/invoice';
import { formatCurrency } from '@/utils';
import { toast } from 'react-hot-toast';
import QRCode from 'qrcode';
import { 
  generatePowerAfricInvoiceHTML, 
  normalizeToUnifiedInvoice, 
  openPowerAfricInvoice 
} from '@/lib/services/invoiceTemplate';
import { 
  FileText, Plus, Search, Filter, Printer, Download, Trash2, Edit3, 
  Eye, CheckCircle2, Clock, XCircle, AlertCircle, Copy, Check, UserCheck, ExternalLink,
  Layers, Package, Wrench, Zap, SlidersHorizontal, Image as ImageIcon, ChevronRight, CheckCircle
} from 'lucide-react';

interface InvoiceManagerProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  mode: 'superadmin' | 'sales_agent';
}

export default function InvoiceManager({ user, mode }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [previewQrCode, setPreviewQrCode] = useState<string>('');

  // Catalog items for quick selection in invoice items
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogAccessories, setCatalogAccessories] = useState<any[]>([]);
  const [catalogServices, setCatalogServices] = useState<any[]>([]);

  // Fetch catalog items for line-item picker
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [prodRes, accRes, servRes] = await Promise.allSettled([
          fetch('/api/products').then(r => r.ok ? r.json() : []),
          fetch('/api/accessories').then(r => r.ok ? r.json() : []),
          fetch('/api/services').then(r => r.ok ? r.json() : []),
        ]);
        if (prodRes.status === 'fulfilled') setCatalogProducts(prodRes.value);
        if (accRes.status === 'fulfilled') setCatalogAccessories(accRes.value);
        if (servRes.status === 'fulfilled') setCatalogServices(servRes.value);
      } catch (err) {
        console.error('Error fetching catalog for invoices:', err);
      }
    };
    fetchCatalog();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('userId', user.id);
      params.append('role', user.role);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());
      if (mode === 'superadmin' && creatorFilter !== 'all') params.append('creator', creatorFilter);

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : []);
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
      toast.error('Connection error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, creatorFilter, mode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Invoice deleted');
        setInvoices(prev => prev.filter(inv => inv.id !== id));
      } else {
        toast.error('Failed to delete invoice');
      }
    } catch {
      toast.error('Error deleting invoice');
    }
  };

  const handleQuickStatusChange = async (invoice: Invoice, newStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Invoice marked as ${newStatus}`);
        setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: newStatus as any } : inv));
        if (previewInvoice && previewInvoice.id === invoice.id) {
          setPreviewInvoice({ ...previewInvoice, status: newStatus as any });
        }
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Open preview modal
  const openPreview = async (invoice: Invoice) => {
    setPreviewInvoice(invoice);
    try {
      const qr = await QRCode.toDataURL(invoice.invoiceNumber, { width: 120, margin: 1 });
      setPreviewQrCode(qr);
    } catch (err) {
      setPreviewQrCode('');
    }
  };

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalValue = invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const paidValue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);
  const pendingValue = invoices
    .filter(inv => inv.status === 'draft' || inv.status === 'issued')
    .reduce((sum, inv) => sum + Number(inv.total || 0), 0);

  // Unique creators for superadmin filter
  const uniqueCreators = Array.from(
    new Map(invoices.map(inv => [inv.createdBy, { id: inv.createdBy, name: inv.creatorName || inv.createdBy, role: inv.creatorRole }])).values()
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1a2a8a]" />
            {mode === 'superadmin' ? 'Invoice Management' : 'My Sales Invoices'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'superadmin' 
              ? 'Create, manage, and track all customer invoices across the platform.'
              : 'Create customer invoices, track payment status, and export PDF documents.'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white font-semibold rounded-xl hover:opacity-95 shadow-md transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Generate New Invoice
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-gray-500">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalInvoices}</div>
          <div className="text-xs text-gray-400 mt-1">{mode === 'superadmin' ? 'All platform invoices' : 'Created by you'}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-gray-500">Total Value</div>
          <div className="text-2xl font-bold text-[#1a2a8a] mt-1">{formatCurrency(totalValue)}</div>
          <div className="text-xs text-gray-400 mt-1">Cumulative invoice sum</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-600">Paid Invoices</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(paidValue)}</div>
          <div className="text-xs text-gray-400 mt-1">Confirmed payments</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="text-xs font-semibold uppercase text-amber-600">Pending / Draft</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(pendingValue)}</div>
          <div className="text-xs text-gray-400 mt-1">Awaiting settlement</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by invoice number, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a2a8a] outline-none text-gray-900"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {mode === 'superadmin' && (
            <select
              value={creatorFilter}
              onChange={(e) => setCreatorFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none"
            >
              <option value="all">All Creators</option>
              {uniqueCreators.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.role || 'Staff'})
                </option>
              ))}
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1a2a8a] mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-20 text-center px-4">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No invoices found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {search || statusFilter !== 'all' 
                ? 'Try adjusting your search filters.' 
                : 'Generate your first customer invoice to get started.'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white font-medium rounded-xl text-sm"
            >
              Generate Invoice
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Customer</th>
                  {mode === 'superadmin' && <th className="px-6 py-4">Created By</th>}
                  <th className="px-6 py-4">Date / Due</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-[#1a2a8a]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{inv.customerName}</div>
                      {inv.customerEmail && (
                        <div className="text-xs text-gray-500">{inv.customerEmail}</div>
                      )}
                    </td>
                    {mode === 'superadmin' && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <UserCheck className="w-3 h-3 text-[#1a2a8a]" />
                          {inv.creatorName || inv.createdBy}
                          {inv.creatorRole === 'sales_agent' && (
                            <span className="text-[10px] text-amber-600 font-bold">(Agent)</span>
                          )}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="text-gray-900">
                        {new Date(inv.issueDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'On receipt'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openPreview(inv)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                          title="Preview & Status"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openPowerAfricInvoice(inv)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-[#40b553] transition-colors"
                          title="Print / Open Invoice Window"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingInvoice(inv);
                            setShowCreateModal(true);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-[#1a2a8a] transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-rose-500 transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Create / Edit Modal */}
      {showCreateModal && (
        <InvoiceFormModal
          isOpen={showCreateModal}
          initialData={editingInvoice}
          user={user}
          catalogProducts={catalogProducts}
          catalogAccessories={catalogAccessories}
          catalogServices={catalogServices}
          onClose={() => {
            setShowCreateModal(false);
            setEditingInvoice(null);
          }}
          onSuccess={(saved) => {
            setShowCreateModal(false);
            setEditingInvoice(null);
            fetchInvoices();
            toast.success(editingInvoice ? 'Invoice updated!' : 'Invoice generated successfully!');
          }}
        />
      )}

      {/* Professional Unified Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          qrCodeUrl={previewQrCode}
          onClose={() => setPreviewInvoice(null)}
          onStatusChange={(status) => handleQuickStatusChange(previewInvoice, status)}
        />
      )}
    </div>
  );
}

// ----------------- Visual Catalogue Picker Modal -----------------
interface CataloguePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalogProducts: any[];
  catalogAccessories: any[];
  catalogServices: any[];
  onSelectItem: (item: {
    type: 'product' | 'accessory' | 'service' | 'custom';
    itemId?: number;
    description: string;
    unitPrice: number;
    image?: string;
    category?: string;
  }) => void;
}

function CataloguePickerModal({
  isOpen,
  onClose,
  catalogProducts,
  catalogAccessories,
  catalogServices,
  onSelectItem,
}: CataloguePickerModalProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'accessories' | 'services'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Custom Service state with flexible price slider
  const [customServiceName, setCustomServiceName] = useState('Custom Solar Installation & Technical Support');
  const [customServicePrice, setCustomServicePrice] = useState<number>(50000);
  const [customServiceCategory, setCustomServiceCategory] = useState('Technical Services');

  if (!isOpen) return null;

  // Extract categories for active tab
  const categories = useMemo(() => {
    let list: any[] = [];
    if (activeTab === 'products') list = catalogProducts;
    else if (activeTab === 'accessories') list = catalogAccessories;
    else if (activeTab === 'services') list = catalogServices;

    const cats = new Set<string>();
    list.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [activeTab, catalogProducts, catalogAccessories, catalogServices]);

  // Filtered lists
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter(p => {
      const matchSearch = !searchQuery || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.spec?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [catalogProducts, searchQuery, selectedCategory]);

  const filteredAccessories = useMemo(() => {
    return catalogAccessories.filter(a => {
      const matchSearch = !searchQuery || 
        a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [catalogAccessories, searchQuery, selectedCategory]);

  const filteredServices = useMemo(() => {
    return catalogServices.filter(s => {
      const matchSearch = !searchQuery || 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [catalogServices, searchQuery, selectedCategory]);

  const handleAddCustomService = () => {
    if (!customServiceName.trim()) {
      toast.error('Please enter a service name');
      return;
    }
    onSelectItem({
      type: 'service',
      description: customServiceName.trim(),
      unitPrice: Number(customServicePrice) || 0,
      category: customServiceCategory,
    });
    toast.success(`Added Custom Service: "${customServiceName.trim()}" (₦${customServicePrice.toLocaleString()})`);
  };

  const presetPrices = [25000, 50000, 100000, 250000, 500000, 1000000, 2000000];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#1a2a8a]/10 rounded-xl text-[#1a2a8a]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Catalogue Item Selector</h3>
              <p className="text-xs text-gray-500">Pick solar products, accessories, or services to add to invoice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Bar & Search */}
        <div className="p-4 border-b border-gray-100 space-y-3 bg-white">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Category Tabs */}
            <div className="inline-flex p-1 bg-gray-100 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => { setActiveTab('products'); setSelectedCategory('all'); }}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'products' ? 'bg-white text-[#1a2a8a] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#1a2a8a]" />
                Solar Products ({catalogProducts.length})
              </button>
              <button
                onClick={() => { setActiveTab('accessories'); setSelectedCategory('all'); }}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'accessories' ? 'bg-white text-[#1a2a8a] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-gray-700" />
                Accessories ({catalogAccessories.length})
              </button>
              <button
                onClick={() => { setActiveTab('services'); setSelectedCategory('all'); }}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'services' ? 'bg-white text-[#40b553] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-[#40b553]" />
                Services & Custom ({catalogServices.length + 1})
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search catalog items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2a8a]"
              />
            </div>
          </div>

          {/* Subcategory Pills */}
          {categories.length > 0 && activeTab !== 'services' && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#1a2a8a] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#1a2a8a] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-gray-50/50">
          {/* TAB 1: SOLAR PRODUCTS */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredProducts.map((p) => (
                <div
                  key={`prod-${p.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:border-[#1a2a8a]/40 hover:shadow-md transition-all group"
                >
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%231a2a8a" stroke-width="1.5"><path d="M12 2v8"/><path d="m4.93 4.93 5.66 5.66"/><path d="M2 12h8"/><path d="m4.93 19.07 5.66-5.66"/><path d="M12 22v-8"/><path d="m19.07 19.07-5.66-5.66"/><path d="M22 12h-8"/><path d="m19.07 4.93-5.66 5.66"/></svg>';
                          }}
                        />
                      ) : (
                        <Zap className="w-8 h-8 text-gray-300" />
                      )}
                      {p.category && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#1a2a8a] rounded-md shadow-xs">
                          {p.category}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{p.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{p.brand} • {p.spec || 'Standard Spec'}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1a2a8a]">{formatCurrency(p.price)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectItem({
                          type: 'product',
                          itemId: p.id,
                          description: p.title,
                          unitPrice: Number(p.price) || 0,
                          image: p.image,
                          category: p.category,
                        });
                        toast.success(`Added "${p.title}"`);
                      }}
                      className="px-2.5 py-1 bg-[#1a2a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#15226e] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ACCESSORIES */}
          {activeTab === 'accessories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredAccessories.map((a) => (
                <div
                  key={`acc-${a.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:border-[#1a2a8a]/40 hover:shadow-md transition-all group"
                >
                  <div className="space-y-2">
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative flex items-center justify-center">
                      {a.image ? (
                        <img
                          src={a.image}
                          alt={a.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="%23555" stroke-width="1.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>';
                          }}
                        />
                      ) : (
                        <Package className="w-8 h-8 text-gray-300" />
                      )}
                      {a.category && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 rounded-md shadow-xs">
                          {a.category}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">{a.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">Unit: {a.unit || 'piece'}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{formatCurrency(a.price)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectItem({
                          type: 'accessory',
                          itemId: a.id,
                          description: a.name,
                          unitPrice: Number(a.price) || 0,
                          image: a.image,
                          category: a.category,
                        });
                        toast.success(`Added "${a.name}"`);
                      }}
                      className="px-2.5 py-1 bg-[#1a2a8a] text-white rounded-lg text-xs font-semibold hover:bg-[#15226e] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SERVICES & CUSTOM SERVICE (WITH FLEXIBLE PRICE RANGE SLIDER) */}
          {activeTab === 'services' && (
            <div className="space-y-5">
              {/* FEATURED: CUSTOM SERVICE WITH FLEXIBLE PRICE SLIDER */}
              <div className="bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/60 border-2 border-[#1a2a8a]/20 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-[#1a2a8a] text-white rounded-xl">
                      <SlidersHorizontal className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-[#1a2a8a]">Custom Energy Service (Flexible Price)</h4>
                      <p className="text-xs text-gray-500">Configure custom installation, site audit, maintenance, or labor charges with flexible pricing</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#40b553] text-[11px] font-bold rounded-full">
                    Dynamic Price
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Service Description / Title
                    </label>
                    <input
                      type="text"
                      value={customServiceName}
                      onChange={(e) => setCustomServiceName(e.target.value)}
                      placeholder="e.g. Inverter Installation & System Rewiring"
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                    />
                  </div>

                  {/* Flexible Price with Range Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-gray-700">
                        Service Price (Flexible Slider):
                      </label>
                      <span className="text-sm font-bold text-[#1a2a8a]">
                        {formatCurrency(customServicePrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="5000"
                        max="3000000"
                        step="5000"
                        value={customServicePrice}
                        onChange={(e) => setCustomServicePrice(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1a2a8a]"
                      />
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={customServicePrice}
                        onChange={(e) => setCustomServicePrice(Math.max(0, Number(e.target.value)))}
                        className="w-28 px-2 py-1 text-right text-xs font-mono font-bold bg-white border border-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] text-gray-400 self-center">Presets:</span>
                      {presetPrices.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCustomServicePrice(preset)}
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-colors ${
                            customServicePrice === preset
                              ? 'bg-[#1a2a8a] text-white'
                              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          ₦{(preset / 1000).toLocaleString()}k
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCustomService}
                    className="px-5 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-sm transition-opacity flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Custom Service to Invoice
                  </button>
                </div>
              </div>

              {/* Standard Catalogue Services */}
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Standard Catalog Services</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredServices.map((s) => (
                    <div
                      key={`serv-${s.id}`}
                      className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col justify-between hover:border-[#40b553]/50 hover:shadow-md transition-all group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 text-[#40b553] rounded-lg">
                            <Wrench className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-900">{s.name}</h4>
                            <span className="text-[10px] text-gray-400">{s.duration || 'Flexible duration'}</span>
                          </div>
                        </div>
                        {s.description && (
                          <p className="text-[11px] text-gray-500 line-clamp-2">{s.description}</p>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-[#40b553]">{formatCurrency(s.price)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectItem({
                              type: 'service',
                              itemId: s.id,
                              description: s.name,
                              unitPrice: Number(s.price) || 0,
                              category: s.category || 'Service',
                            });
                            toast.success(`Added "${s.name}"`);
                          }}
                          className="px-2.5 py-1 bg-[#40b553] text-white rounded-lg text-xs font-semibold hover:bg-[#349444] transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1a2a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#15226e] transition-colors"
          >
            Done Selecting Items
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------- Create / Edit Invoice Modal -----------------
interface InvoiceFormModalProps {
  isOpen: boolean;
  initialData: Invoice | null;
  user: any;
  catalogProducts: any[];
  catalogAccessories: any[];
  catalogServices: any[];
  onClose: () => void;
  onSuccess: (invoice: Invoice) => void;
}

function InvoiceFormModal({
  isOpen,
  initialData,
  user,
  catalogProducts,
  catalogAccessories,
  catalogServices,
  onClose,
  onSuccess,
}: InvoiceFormModalProps) {
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || '');
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || '');
  const [customerAddress, setCustomerAddress] = useState(initialData?.customerAddress || '');
  const [issueDate, setIssueDate] = useState(
    initialData?.issueDate ? new Date(initialData.issueDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate ? new Date(initialData.dueDate).toISOString().slice(0, 10) : ''
  );
  const [status, setStatus] = useState<string>(initialData?.status || 'issued');
  const [taxRate, setTaxRate] = useState<number>(initialData?.taxRate !== undefined ? Number(initialData.taxRate) : 7.5);
  const [discount, setDiscount] = useState<number>(initialData?.discount !== undefined ? Number(initialData.discount) : 0);
  const [notes, setNotes] = useState(initialData?.notes || 'Payment is required within specified due date. Thank you for your business!');
  const [terms, setTerms] = useState(initialData?.terms || '• Prices and product availability may change without notice.\n• Orders are processed only after payment confirmation.\n• Warranty applies as per manufacturer terms.');

  // Payment bank info - default to GTBank 0500647850
  const [bankName, setBankName] = useState(initialData?.bankName || 'GTBank Plc.');
  const [accountName, setAccountName] = useState(initialData?.accountName || 'Power Afric Energy Serv. LTD');
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || '0500647850');

  // Items
  const [items, setItems] = useState<InvoiceItem[]>(
    initialData?.items && initialData.items.length > 0
      ? initialData.items
      : [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0, type: 'custom' }]
  );

  const [saving, setSaving] = useState(false);
  const [showCataloguePicker, setShowCataloguePicker] = useState(false);

  // Recalculate totals
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity || 1) * Number(item.unitPrice || 0)), 0);
  const discountedSubtotal = Math.max(0, subtotal - Number(discount || 0));
  const taxAmount = (discountedSubtotal * Number(taxRate || 0)) / 100;
  const grandTotal = discountedSubtotal + taxAmount;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const item = { ...updated[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) || 0 : Number(item.quantity) || 0;
        const price = field === 'unitPrice' ? Number(value) || 0 : Number(item.unitPrice) || 0;
        item.total = qty * price;
      }
      updated[index] = item;
      return updated;
    });
  };

  const handleSelectFromPicker = (selected: {
    type: 'product' | 'accessory' | 'service' | 'custom';
    itemId?: number;
    description: string;
    unitPrice: number;
    image?: string;
    category?: string;
  }) => {
    setItems(prev => {
      // If the last item is blank, overwrite it
      if (prev.length === 1 && !prev[0].description.trim() && prev[0].unitPrice === 0) {
        return [{
          id: Date.now().toString(),
          itemId: selected.itemId,
          type: selected.type,
          description: selected.description,
          unitPrice: selected.unitPrice,
          quantity: 1,
          total: selected.unitPrice,
          image: selected.image,
          category: selected.category,
        }];
      }

      // Otherwise append
      return [
        ...prev,
        {
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          itemId: selected.itemId,
          type: selected.type,
          description: selected.description,
          unitPrice: selected.unitPrice,
          quantity: 1,
          total: selected.unitPrice,
          image: selected.image,
          category: selected.category,
        }
      ];
    });
  };

  const handleSelectFromCatalog = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [type, idStr] = val.split(':');
    const id = Number(idStr);

    let found: any = null;
    if (type === 'product') found = catalogProducts.find(p => p.id === id);
    else if (type === 'accessory') found = catalogAccessories.find(a => a.id === id);
    else if (type === 'service') found = catalogServices.find(s => s.id === id);

    if (found) {
      setItems(prev => {
        const updated = [...prev];
        const title = found.title || found.name;
        const price = Number(found.price || 0);
        const qty = Number(updated[index].quantity) || 1;
        updated[index] = {
          ...updated[index],
          itemId: id,
          type: type as any,
          description: title,
          unitPrice: price,
          total: qty * price,
          image: found.image,
          category: found.category,
        };
        return updated;
      });
    }
  };

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0, type: 'custom' },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) {
      setItems([{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0, type: 'custom' }]);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const validItems = items.filter(it => it.description.trim() !== '');
    if (validItems.length === 0) {
      toast.error('Please add at least one line item with a description');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        issueDate,
        dueDate: dueDate || null,
        status,
        taxRate,
        discount,
        items: validItems,
        bankName,
        accountName,
        accountNumber,
        notes,
        terms,
        createdBy: initialData?.createdBy || user.id,
        creatorName: initialData?.creatorName || `${user.firstName} ${user.lastName}`.trim(),
        creatorEmail: initialData?.creatorEmail || user.email,
        creatorRole: initialData?.creatorRole || user.role,
      };

      const url = initialData ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save invoice');
      }

      onSuccess(data);
    } catch (err: any) {
      console.error('Invoice save error:', err);
      toast.error(err.message || 'Error saving invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 my-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1a2a8a]" />
                {initialData ? `Edit Invoice: ${initialData.invoiceNumber}` : 'Create New Customer Invoice'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in customer details, catalogue line items, flexible services, and payment terms.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Customer & Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Customer Details</h4>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Customer / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe / Acme Solar Ltd"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Email</label>
                    <input
                      type="email"
                      placeholder="customer@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+234 800 000 0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Billing / Delivery Address</label>
                  <textarea
                    rows={2}
                    placeholder="Street, City, State, Country"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Invoice Timeline & Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-2 focus:ring-[#1a2a8a]"
                  >
                    <option value="draft">Draft (Preparing)</option>
                    <option value="issued">Issued (Sent to Client)</option>
                    <option value="paid">Paid (Payment Confirmed)</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Bank details highlight */}
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-gray-700 space-y-1">
                  <div className="font-bold text-[#1a2a8a]">Payment Account:</div>
                  <div><strong>Bank:</strong> {bankName}</div>
                  <div><strong>Account Name:</strong> {accountName}</div>
                  <div><strong>Account Number:</strong> <span className="font-mono font-bold text-[#1a2a8a]">{accountNumber}</span></div>
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900">Invoice Items</h4>
                  <p className="text-xs text-gray-500">Pick items with pictures from catalogue or configure custom flexible services.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCataloguePicker(true)}
                    className="px-3.5 py-1.5 bg-[#1a2a8a] text-white rounded-xl text-xs font-semibold hover:bg-[#15226e] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Package className="w-3.5 h-3.5" />
                    + Browse Catalogue
                  </button>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Blank Row
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      {/* Image Thumbnail / Category Icon */}
                      <div className="md:col-span-1 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).style.display = 'none';
                              }}
                            />
                          ) : item.type === 'service' ? (
                            <Wrench className="w-5 h-5 text-[#40b553]" />
                          ) : item.type === 'accessory' ? (
                            <Package className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Zap className="w-5 h-5 text-[#1a2a8a]" />
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="md:col-span-5">
                        <input
                          type="text"
                          placeholder="Item Description *"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-1 focus:ring-[#1a2a8a]"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-2 text-xs text-center bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-1 focus:ring-[#1a2a8a]"
                          />
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">₦</span>
                          <input
                            type="number"
                            step="any"
                            placeholder="Price"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full px-2.5 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:ring-1 focus:ring-[#1a2a8a]"
                          />
                        </div>
                      </div>

                      {/* Total & Delete */}
                      <div className="md:col-span-2 flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-gray-900">
                          {formatCurrency(item.total)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive Slider for Services / Custom Items */}
                    {(item.type === 'service' || item.type === 'custom') && (
                      <div className="pt-2 border-t border-gray-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/70 px-3 py-1.5 rounded-lg">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-[#1a2a8a]" />
                          <span className="font-semibold">Flexible Service Price:</span>
                        </div>
                        <div className="flex-1 max-w-sm flex items-center gap-2">
                          <input
                            type="range"
                            min="5000"
                            max="3000000"
                            step="5000"
                            value={item.unitPrice || 0}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                            className="flex-1 h-1.5 bg-gray-200 rounded appearance-none cursor-pointer accent-[#1a2a8a]"
                          />
                          <span className="text-[11px] font-mono font-bold text-[#1a2a8a] whitespace-nowrap">
                            {formatCurrency(item.unitPrice || 0)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary & Discount/Tax */}
            <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Notes to Customer</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Terms & Conditions</label>
                  <textarea
                    rows={2}
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-3 text-gray-600">
                  <span className="text-xs">Discount (₦):</span>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-28 px-2 py-1 text-right text-xs bg-white border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 text-gray-600">
                  <span className="text-xs">VAT Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                    className="w-28 px-2 py-1 text-right text-xs bg-white border border-gray-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-between text-gray-600 text-xs">
                  <span>VAT Amount:</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Grand Total:</span>
                  <span className="text-xl font-extrabold text-[#1a2a8a]">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-xl text-sm font-semibold hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md"
              >
                {saving ? 'Saving Invoice...' : initialData ? 'Update Invoice' : 'Save & Issue Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Visual Catalogue Picker Modal */}
      {showCataloguePicker && (
        <CataloguePickerModal
          isOpen={showCataloguePicker}
          onClose={() => setShowCataloguePicker(false)}
          catalogProducts={catalogProducts}
          catalogAccessories={catalogAccessories}
          catalogServices={catalogServices}
          onSelectItem={handleSelectFromPicker}
        />
      )}
    </>
  );
}

// ----------------- Professional Invoice Preview & Print Modal -----------------
interface InvoicePreviewModalProps {
  invoice: Invoice;
  qrCodeUrl: string;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

function InvoicePreviewModal({ invoice, qrCodeUrl, onClose, onStatusChange }: InvoicePreviewModalProps) {
  const unifiedData = useMemo(() => normalizeToUnifiedInvoice(invoice), [invoice]);
  const invoiceHtml = useMemo(() => generatePowerAfricInvoiceHTML(unifiedData, qrCodeUrl), [unifiedData, qrCodeUrl]);

  const handlePrint = async () => {
    await openPowerAfricInvoice(invoice);
  };

  const copyRefLink = () => {
    navigator.clipboard.writeText(invoice.invoiceNumber);
    toast.success('Invoice reference copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[95vh] flex flex-col shadow-2xl border border-gray-200 my-auto">
        {/* Action Toolbar */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900 font-mono">
              {invoice.invoiceNumber}
            </h3>
            <StatusBadge status={invoice.status} />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={invoice.status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800"
            >
              <option value="draft">Mark as Draft</option>
              <option value="issued">Mark as Issued</option>
              <option value="paid">Mark as Paid</option>
              <option value="overdue">Mark as Overdue</option>
              <option value="cancelled">Mark as Cancelled</option>
            </select>

            <button
              onClick={copyRefLink}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg text-xs flex items-center gap-1"
              title="Copy invoice ref"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg text-xs font-semibold hover:opacity-95 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" /> Open Print View / PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Live Exact Preview Frame (Unified identical template with customer orders) */}
        <div className="flex-1 w-full bg-gray-100 p-2 sm:p-4 overflow-hidden rounded-b-2xl">
          <iframe
            srcDoc={invoiceHtml}
            title={`Invoice ${invoice.invoiceNumber}`}
            className="w-full h-full border-0 rounded-xl bg-white shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}

// ----------------- Status Badge Component -----------------
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Paid
        </span>
      );
    case 'issued':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#1a2a8a] border border-blue-200">
          <Clock className="w-3 h-3 text-[#1a2a8a]" />
          Issued
        </span>
      );
    case 'overdue':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertCircle className="w-3 h-3 text-rose-600" />
          Overdue
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
          <XCircle className="w-3 h-3 text-gray-500" />
          Cancelled
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Draft
        </span>
      );
  }
}
