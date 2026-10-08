'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '@/types/auth';
import { formatCurrency } from '@/utils';
import { catalogRequest } from '@/lib/data/catalogRequest';
import {
  Plus, Edit, Trash2, Eye, EyeOff,
  Search, Filter, X, Check, Clock,
  Tag, DollarSign, Image as ImageIcon,
  Wrench, Package, Save, AlertCircle
} from 'lucide-react';
import ConfirmationModal from '@/components/admin/ConfirmationModal';

interface MaterialItem {
  sn: number;
  description: string;
  qty: number;
  unitCost: number;
  total: number;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [visibilityModal, setVisibilityModal] = useState<{
    isOpen: boolean;
    serviceId: number;
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
    duration: '',
    image: '',
    features: ''
  });

  const categories = ['installation', 'installation material', 'maintenance', 'repair', 'upgrade', 'consultation'];

  const calculateTotalPrice = (items: MaterialItem[]) => {
    return items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await catalogRequest<Service[]>('/api/services?active=false');
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'price' || name === 'costPrice') {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      await catalogRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          costPrice: Number(formData.costPrice),
          features: formData.features ? formData.features.split(',').map(f => f.trim()).filter(Boolean) : []
        })
      });

      setSuccess(editingService ? 'Service updated successfully!' : 'Service created successfully!');
      await fetchServices();
      resetForm();
      setIsAdding(false);
      setEditingService(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price?.toString() || '',
      costPrice: service.costPrice?.toString() || '',
      category: service.category || '',
      duration: service.duration || '',
      image: service.image || '',
      features: service.features?.join(', ') || ''
    });
    setIsAdding(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setError(null);
    setSuccess(null);
    try {
      await catalogRequest(`/api/services/${id}`, { method: 'DELETE' });
      setSuccess('Service deleted successfully!');
      await fetchServices();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const requestToggleVisibility = (service: Service) => {
    setVisibilityModal({
      isOpen: true,
      serviceId: service.id,
      name: service.name,
      isCurrentlyVisible: !!service.isActive
    });
  };

  const handleConfirmVisibilityToggle = async () => {
    if (!visibilityModal) return;
    const { serviceId, isCurrentlyVisible } = visibilityModal;
    const newStatus = !isCurrentlyVisible;
    setIsUpdatingVisibility(true);
    setError(null);
    try {
      await catalogRequest(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      });
      setSuccess(newStatus ? 'Service is now visible in the store' : 'Service is now hidden from the store');
      await fetchServices();
      setTimeout(() => setSuccess(null), 3000);
      setVisibilityModal(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service visibility');
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
      duration: '',
      image: '',
      features: ''
    });
    setMaterialItems([]);
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && !services.length) {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Services</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create and manage installation services and materials
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingService(null);
            setIsAdding(true);
            setError(null);
            setSuccess(null);
          }}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-[#1a2a8a] text-white rounded-lg hover:bg-[#0f1a66] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
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
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingService(null);
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
                  Service Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter service name"
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
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (₦) *
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
                  Cost Price (₦)
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
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 2-3 days"
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
                placeholder="Describe the service..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Features (comma separated)
              </label>
              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a2a8a] dark:focus:ring-green-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Feature 1, Feature 2, Feature 3"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : (editingService ? 'Update Service' : 'Create Service')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingService(null);
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
            placeholder="Search services..."
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
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or add a new service</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const profit = service.price - (service.costPrice || 0);
            const margin = service.price > 0 ? (profit / service.price) * 100 : 0;
            return (
              <div
                key={service.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                  !service.isActive
                    ? 'border-dashed border-red-300 dark:border-red-800/80 bg-red-50/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="relative h-48 bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className={`w-full h-full object-cover ${!service.isActive ? 'opacity-75 grayscale-[20%]' : ''}`}
                    />
                  ) : (
                    <Wrench className="w-16 h-16 text-white/50" />
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => requestToggleVisibility(service)}
                      className={`p-2 rounded-lg shadow-sm transition-all active:scale-95 ${
                        !service.isActive
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-white/90 dark:bg-gray-800/90 hover:bg-white text-green-600'
                      }`}
                      title={service.isActive ? 'Hide from store' : 'Unhide (Show in store)'}
                      aria-label={service.isActive ? 'Hide service' : 'Unhide service'}
                    >
                      {service.isActive ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    {!service.isActive && (
                      <span className="px-2.5 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5" />
                        Hidden from Store
                      </span>
                    )}
                    {service.category && (
                      <span className="px-2 py-0.5 bg-white/90 dark:bg-gray-800/90 text-xs font-medium rounded-lg text-gray-800 dark:text-gray-200 shadow-sm">
                        {service.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#1a2a8a] dark:text-green-400">
                        {formatCurrency(service.price)}
                      </p>
                      {(service.costPrice ?? 0) > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Cost: {formatCurrency(service.costPrice ?? 0)}
                        </p>
                      )}
                    </div>
                    {(service.costPrice ?? 0) > 0 && (
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Profit: {formatCurrency(profit)}
                        </p>
                        <p className={`text-xs ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {margin.toFixed(1)}% margin
                        </p>
                      </div>
                    )}
                  </div>
                  {service.duration && (
                    <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => requestToggleVisibility(service)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                        !service.isActive
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border-amber-300 dark:border-amber-800'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border-gray-200 dark:border-gray-600'
                      }`}
                      title={service.isActive ? 'Hide service from store' : 'Unhide (Make visible in store)'}
                    >
                      {service.isActive ? (
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
                      onClick={() => handleEdit(service)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-[#1a2a8a] dark:text-blue-400 border border-[#1a2a8a] dark:border-blue-400 rounded-lg hover:bg-[#1a2a8a] hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete service"
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
          title={visibilityModal.isCurrentlyVisible ? "Hide Service from Store?" : "Unhide Service?"}
          message={
            visibilityModal.isCurrentlyVisible
              ? `Are you sure you want to hide "${visibilityModal.name}" from the customer store? Customers will not be able to view or book this service until unhidden. Existing orders will not be affected.`
              : `Make "${visibilityModal.name}" visible in the customer store? Customers will be able to discover and book this service again.`
          }
          confirmLabel={visibilityModal.isCurrentlyVisible ? "Hide Service" : "Make Visible"}
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