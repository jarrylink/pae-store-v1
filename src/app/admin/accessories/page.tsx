'use client';

import React, { useState, useEffect } from 'react';
import { Accessory } from '@/types/auth';
import { formatCurrency } from '@/utils';
import { catalogRequest } from '@/lib/data/catalogRequest';
import {
  Plus, Edit, Trash2, Eye, EyeOff,
  Search, Filter, X, Check,
  Tag, DollarSign, Package,
  Wrench, Save, AlertCircle,
  Box
} from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

export default function AdminAccessoriesPage() {
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [visibilityModal, setVisibilityModal] = useState<{
    isOpen: boolean;
    accessoryId: number;
    name: string;
    isCurrentlyVisible: boolean;
  } | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    category: '',
    image: '',
    sku: '',
    unit: 'piece',
    stock: '',
    isActive: true
  });

  const categories = ['Solar', 'Electrical', 'Mounting', 'Cables', 'Connectors', 'Tools', 'Safety'];

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      const data = await catalogRequest<Accessory[]>('/api/accessories?active=false');
      setAccessories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accessories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingAccessory ? `/api/accessories/${editingAccessory.id}` : '/api/accessories';
      const method = editingAccessory ? 'PUT' : 'POST';

      await catalogRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice),
          stock: formData.stock === '' ? 0 : Number(formData.stock)
        })
      });

      setSuccess(editingAccessory ? 'Accessory updated successfully!' : 'Accessory created successfully!');
      await fetchAccessories();
      resetForm();
      setIsAdding(false);
      setEditingAccessory(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (accessory: Accessory) => {
    setEditingAccessory(accessory);
    setFormData({
      name: accessory.name || '',
      description: accessory.description || '',
      price: accessory.price?.toString() || '',
      costPrice: accessory.costPrice?.toString() || '',
      category: accessory.category || '',
      image: accessory.image || '',
      sku: accessory.sku || '',
      unit: accessory.unit || 'piece',
      stock: accessory.stock?.toString() || '',
      isActive: accessory.isActive !== undefined ? accessory.isActive : true
    });
    setIsAdding(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this accessory?')) return;

    setError(null);
    setSuccess(null);
    try {
      await catalogRequest(`/api/accessories/${id}`, { method: 'DELETE' });
      setSuccess('Accessory deleted successfully!');
      await fetchAccessories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete accessory');
    }
  };

  const requestToggleVisibility = (accessory: Accessory) => {
    setVisibilityModal({
      isOpen: true,
      accessoryId: accessory.id,
      name: accessory.name,
      isCurrentlyVisible: !!accessory.isActive
    });
  };

  const handleConfirmVisibilityToggle = async () => {
    if (!visibilityModal) return;
    const { accessoryId, isCurrentlyVisible } = visibilityModal;
    const newStatus = !isCurrentlyVisible;
    setIsUpdatingVisibility(true);
    setError(null);
    try {
      await catalogRequest(`/api/accessories/${accessoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      setSuccess(newStatus ? 'Accessory is now visible in the store' : 'Accessory is now hidden from the store');
      await fetchAccessories();
      setTimeout(() => setSuccess(null), 3000);
      setVisibilityModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update accessory visibility');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      category: '',
      image: '',
      sku: '',
      unit: 'piece',
      stock: '',
      isActive: true
    });
  };

  const filteredAccessories = accessories.filter(accessory => {
    const matchesSearch = accessory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accessory.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accessory.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || accessory.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && accessory.isActive) ||
                         (statusFilter === 'inactive' && !accessory.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && !accessories.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2a8a]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Accessories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage installation accessories
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingAccessory(null);
            setIsAdding(true);
            setError(null);
            setSuccess(null);
          }}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Accessory
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
            </h2>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingAccessory(null);
                resetForm();
                setError(null);
                setSuccess(null);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Accessory Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter accessory name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (â‚¦) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cost Price (â‚¦)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Cost price for profit calculation
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., ACC-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="piece">Piece</option>
                  <option value="meter">Meter</option>
                  <option value="yard">Yard</option>
                  <option value="set">Set</option>
                  <option value="kg">Kg</option>
                  <option value="roll">Roll</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the accessory..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#1a2a8a] border-gray-300 rounded focus:ring-[#1a2a8a]"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editingAccessory ? 'Update Accessory' : 'Create Accessory')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingAccessory(null);
                  resetForm();
                  setError(null);
                  setSuccess(null);
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search accessories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Accessories Grid */}
      {filteredAccessories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No accessories found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new accessory</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAccessories.map((accessory) => {
            const profit = accessory.price - (accessory.costPrice || 0);
            const margin = accessory.price > 0 ? (profit / accessory.price) * 100 : 0;
            return (
              <div
                key={accessory.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                  !accessory.isActive
                    ? 'border-dashed border-red-300 dark:border-red-800/80 bg-red-50/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                  {accessory.image ? (
                    <img
                      src={accessory.image}
                      alt={accessory.name}
                      className={`w-full h-full object-cover ${!accessory.isActive ? 'opacity-75 grayscale-[20%]' : ''}`}
                    />
                  ) : (
                    <Package className="w-16 h-16 text-white/50" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => requestToggleVisibility(accessory)}
                      className={`p-2 rounded-lg shadow-sm transition-all active:scale-95 ${
                        !accessory.isActive
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white text-green-600'
                      }`}
                      title={accessory.isActive ? 'Hide from store' : 'Unhide (Show in store)'}
                      aria-label={accessory.isActive ? 'Hide accessory' : 'Unhide accessory'}
                    >
                      {accessory.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {!accessory.isActive && (
                      <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5" />
                        Hidden from Store
                      </span>
                    )}
                    {accessory.category && (
                      <span className="px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 text-xs font-medium rounded-lg text-gray-800 dark:text-gray-200 shadow-sm">
                        {accessory.category}
                      </span>
                    )}
                  </div>
                  {accessory.stock !== undefined && accessory.stock <= 5 && (
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-lg">
                        Low Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                    {accessory.name}
                  </h3>
                  {accessory.sku && (
                    <p className="text-xs text-gray-400">SKU: {accessory.sku}</p>
                  )}
                  {accessory.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {accessory.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#1a2a8a] dark:text-blue-400">
                        {formatCurrency(accessory.price)}
                      </p>
                      {(accessory.costPrice ?? 0) > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cost: {formatCurrency(accessory.costPrice ?? 0)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {(accessory.costPrice ?? 0) > 0 && (
                        <>
                          <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Profit: {formatCurrency(profit)}
                          </p>
                          <p className={`text-xs ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {margin.toFixed(1)}% margin
                          </p>
                        </>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {accessory.stock || 0} {accessory.unit}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => requestToggleVisibility(accessory)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                        !accessory.isActive
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border-amber-300 dark:border-amber-800'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border-gray-200 dark:border-gray-600'
                      }`}
                      title={accessory.isActive ? 'Hide accessory from store' : 'Unhide (Make visible in store)'}
                    >
                      {accessory.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4 text-gray-500" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-green-600" />
                          <span>Unhide</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(accessory)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-[#1a2a8a] dark:text-blue-400 border border-[#1a2a8a] dark:border-blue-400 rounded-lg hover:bg-[#1a2a8a] hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(accessory.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete accessory"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visibilityModal && (
        <ConfirmationModal
          isOpen={visibilityModal.isOpen}
          title={visibilityModal.isCurrentlyVisible ? "Hide Accessory from Store?" : "Unhide Accessory?"}
          message={
            visibilityModal.isCurrentlyVisible
              ? `Are you sure you want to hide "${visibilityModal.name}" from the customer store? Customers will not be able to view or purchase this accessory until unhidden. Existing orders will not be affected.`
              : `Make "${visibilityModal.name}" visible in the customer store? Customers will be able to discover and purchase this accessory again.`
          }
          confirmLabel={visibilityModal.isCurrentlyVisible ? "Hide Accessory" : "Make Visible"}
          confirmVariant={visibilityModal.isCurrentlyVisible ? "warning" : "primary"}
          iconType={visibilityModal.isCurrentlyVisible ? "hide" : "unhide"}
          isProcessing={isUpdatingVisibility}
          onConfirm={handleConfirmVisibilityToggle}
          onCancel={() => setVisibilityModal(null)}
        />
      )}
    </div>
  );
}
