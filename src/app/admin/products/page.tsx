'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productsService } from '@/lib/data/productsService';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';
import ConfirmationModal from '@/components/admin/ConfirmationModal';
import {
  Plus, Search, Edit, Trash2, RefreshCw, Check, X,
  Package, DollarSign, Battery, Shield, Eye, EyeOff
} from 'lucide-react';

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden' | 'outOfStock'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [visibilityModal, setVisibilityModal] = useState<{
    isOpen: boolean;
    productId: number;
    title: string;
    isCurrentlyVisible: boolean;
  } | null>(null);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    hidden: 0,
    totalValue: 0
  });

  const calculateStats = (productsList: Product[]) => {
    const list = Array.isArray(productsList) ? productsList : [];
    const total = list.length;
    const inStock = list.filter(p => p?.inStock && p?.isActive !== false).length;
    const lowStock = list.filter(p => (p?.inventory || 0) < 10 && (p?.inventory || 0) > 0).length;
    const outOfStock = list.filter(p => !p?.inStock || (p?.inventory || 0) === 0).length;
    const hidden = list.filter(p => p?.isActive === false).length;
    const totalValue = list.reduce((sum, p) => sum + ((p?.price || 0) * (p?.inventory || 0)), 0);
    setStats({ total, inStock, lowStock, outOfStock, hidden, totalValue });
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productsService.getAllProducts(true);
      const productsArray = Array.isArray(fetchedProducts) ? fetchedProducts : [];
      setProducts(productsArray);
      setFilteredProducts(productsArray);

      const uniqueCategories = ['all', ...Array.from(new Set(productsArray.map(p => p.category)))];
      setCategories(uniqueCategories);

      calculateStats(productsArray);

      if (productsArray.length === 0) {
        setSuccessMessage('No products found. Add your first product!');
      } else {
        setSuccessMessage(`Loaded ${productsArray.length} products successfully`);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products. Please try again.');
      setProducts([]);
      setFilteredProducts([]);
      setCategories(['all']);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    let results = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.spec.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    if (statusFilter === 'active') {
      results = results.filter(product => product.isActive !== false);
    } else if (statusFilter === 'hidden') {
      results = results.filter(product => product.isActive === false);
    } else if (statusFilter === 'outOfStock') {
      results = results.filter(product => !product.inStock || product.inventory === 0);
    }

    setFilteredProducts(results);
    calculateStats(results);
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const requestToggleVisibility = (product: Product) => {
    const isVisible = product.isActive !== false;
    setVisibilityModal({
      isOpen: true,
      productId: product.id,
      title: product.title,
      isCurrentlyVisible: isVisible
    });
  };

  const handleConfirmVisibilityToggle = async () => {
    if (!visibilityModal) return;
    const { productId, isCurrentlyVisible } = visibilityModal;
    const newStatus = !isCurrentlyVisible;
    setIsUpdatingVisibility(true);
    setError(null);
    try {
      await productsService.toggleProductStatus(productId, newStatus);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: newStatus } : p));
      setFilteredProducts(prev => prev.map(p => p.id === productId ? { ...p, isActive: newStatus } : p));
      setSuccessMessage(newStatus ? 'Product is now visible in the store' : 'Product is now hidden from the store');
      setTimeout(() => setSuccessMessage(null), 3000);
      setVisibilityModal(null);
    } catch (error) {
      console.error('Failed to toggle product visibility:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product visibility.');
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleAddProduct = async (productData: any) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const newProduct = await productsService.createProduct(productData);
      await loadProducts();
      setShowProductForm(false);
      const productTitle = newProduct?.title ?? 'Product';
      setSuccessMessage(`Product "${productTitle}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to create product:', error);
      setError(error instanceof Error ? error.message : 'Failed to create product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = async (productData: any) => {
    if (!editingProduct) return;

    setSaving(true);
    setError(null);
    try {
      await productsService.updateProduct(editingProduct.id, productData);
      await loadProducts();
      setEditingProduct(null);
      setShowProductForm(false);
      setSuccessMessage(`Product updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update product:', error);
      setError(error instanceof Error ? error.message : 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setSaving(true);
    setError(null);
    try {
      await productsService.deleteProduct(productId);
      await loadProducts();
      setSelectedProducts(prev => prev.filter(id => id !== productId));
      setSuccessMessage('Product deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    if (!window.confirm(`Delete ${selectedProducts.length} selected products?`)) return;

    setSaving(true);
    setError(null);
    try {
      const results = await Promise.allSettled(selectedProducts.map(id => productsService.deleteProduct(id)));
      const failedIds = selectedProducts.filter((_, index) => results[index].status === 'rejected');
      await loadProducts();
      setSelectedProducts(failedIds);
      const deletedCount = selectedProducts.length - failedIds.length;
      setSuccessMessage(deletedCount ? `${deletedCount} products deleted successfully!` : null);
      const failure = results.find(result => result.status === 'rejected');
      if (failure?.status === 'rejected') setError(failure.reason instanceof Error ? failure.reason.message : 'Some products could not be deleted.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete products:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete products. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditingProduct(product);
      setShowProductForm(true);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  };

  const getStockStatusColor = (inventory: number, inStock: boolean) => {
    if (!inStock || inventory === 0) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (inventory < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  };

  const getStockStatusText = (inventory: number, inStock: boolean) => {
    if (!inStock || inventory === 0) return 'Out of Stock';
    if (inventory < 10) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1a2a8a] mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your store products, inventory, pricing, and store visibility.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => loadProducts()} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </button>
          <button onClick={() => setShowProductForm(true)} className="px-4 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all flex items-center">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 flex items-center"><X className="w-5 h-5 mr-2" />{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-400 flex items-center"><Check className="w-5 h-5 mr-2" />{successMessage}</p>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">Total</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Package className="w-7 h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">Visible In Stock</p>
              <p className="text-2xl font-bold mt-1">{stats.inStock}</p>
            </div>
            <Check className="w-7 h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">Low Stock</p>
              <p className="text-2xl font-bold mt-1">{stats.lowStock}</p>
            </div>
            <Battery className="w-7 h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">Out of Stock</p>
              <p className="text-2xl font-bold mt-1">{stats.outOfStock}</p>
            </div>
            <X className="w-7 h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">Hidden from Store</p>
              <p className="text-2xl font-bold mt-1">{stats.hidden}</p>
            </div>
            <EyeOff className="w-7 h-7 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-90">Total Value</p>
              <p className="text-lg font-bold mt-1 truncate">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="w-7 h-7 opacity-80" />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, brand, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] text-sm"
              />
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-white dark:bg-gray-800">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] text-sm"
              >
                <option value="all" className="bg-white dark:bg-gray-800">All Visibility / Stock</option>
                <option value="active" className="bg-white dark:bg-gray-800">Visible in Store</option>
                <option value="hidden" className="bg-white dark:bg-gray-800">Hidden from Store</option>
                <option value="outOfStock" className="bg-white dark:bg-gray-800">Out of Stock</option>
              </select>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'grid' | 'table')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] text-sm"
              >
                <option value="grid" className="bg-white dark:bg-gray-800">Grid View</option>
                <option value="table" className="bg-white dark:bg-gray-800">Table View</option>
              </select>
            </div>
          </div>
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={saving}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Selected ({selectedProducts.length})
            </button>
          )}
        </div>
      </div>

      {showProductForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
            <ProductForm
              key={editingProduct?.id ?? 'new'}
              product={editingProduct || undefined}
              onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              onCancel={() => { setShowProductForm(false); setEditingProduct(null); }}
              isSubmitting={saving}
            />
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first product'}
          </p>
          <button
            onClick={() => setShowProductForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all"
          >
            Add Your First Product
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View with Hide/Unhide Functionality */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border overflow-hidden hover:shadow-xl transition-all ${
                product.isActive === false
                  ? 'border-dashed border-red-300 dark:border-red-800/80 bg-red-50/10'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.title}
                  className={`w-full h-full object-cover transition-transform duration-500 hover:scale-110 ${
                    product.isActive === false ? 'opacity-75 grayscale-[20%]' : ''
                  }`}
                />
                
                {/* Top-left: Checkbox and Hidden Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white shadow-sm"
                  />
                  {product.isActive === false && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white shadow-sm flex items-center gap-1">
                      <EyeOff className="w-3.5 h-3.5" />
                      Hidden from Store
                    </span>
                  )}
                </div>

                {/* Top-right: Hide/Unhide Eye Button & Stock Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => requestToggleVisibility(product)}
                    className={`p-2 rounded-lg shadow-sm transition-all active:scale-95 ${
                      product.isActive === false
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white/95 dark:bg-gray-800/95 text-green-600 hover:bg-white dark:hover:bg-gray-800'
                    }`}
                    title={product.isActive === false ? 'Unhide (Make visible in store)' : 'Hide product from store'}
                    aria-label={product.isActive === false ? 'Unhide product' : 'Hide product'}
                  >
                    {product.isActive === false ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getStockStatusColor(product.inventory, product.inStock)}`}>
                    {getStockStatusText(product.inventory, product.inStock)}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand} • {product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-[#1a2a8a] dark:text-blue-400">{formatCurrency(product.price)}</span>
                </div>
                
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{product.spec}</p>

                <div className="flex items-center justify-between text-sm mb-5">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Inventory: <span className="font-semibold text-gray-900 dark:text-white">{product.inventory}</span>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{product.warranty}</span>
                  </div>
                </div>

                {/* Card Action Buttons: Hide/Unhide, Edit, Delete */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => requestToggleVisibility(product)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 border ${
                      product.isActive === false
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border-amber-300 dark:border-amber-800'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 border-gray-200 dark:border-gray-600'
                    }`}
                    title={product.isActive === false ? 'Unhide (Make visible in store)' : 'Hide product from store'}
                  >
                    {product.isActive === false ? (
                      <>
                        <Eye className="w-4 h-4 text-green-600" />
                        <span>Unhide</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-gray-500" />
                        <span>Hide</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleViewDetails(product.id)}
                    className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center font-medium text-sm border border-blue-200 dark:border-blue-800"
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors border border-red-200 dark:border-red-800"
                    title="Delete product"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View with Hide/Unhide Functionality */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Product</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Price</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Inventory</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${
                      product.isActive === false ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                    }`}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className={`w-10 h-10 rounded-lg object-cover mr-3 ${product.isActive === false ? 'opacity-70' : ''}`}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                            {product.title}
                            {product.isActive === false && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                Hidden
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900 dark:text-white">{product.inventory}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.inventory, product.inStock)}`}>
                          {getStockStatusText(product.inventory, product.inStock)}
                        </span>
                        {product.isActive === false ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
                            <EyeOff className="w-3 h-3" /> Hidden from store
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Visible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => requestToggleVisibility(product)}
                          className={`p-2 rounded-lg transition-colors ${
                            product.isActive === false
                              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                          }`}
                          title={product.isActive === false ? 'Unhide (Make visible in store)' : 'Hide product from store'}
                        >
                          {product.isActive === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleViewDetails(product.id)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
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
        </div>
      )}

      {visibilityModal && (
        <ConfirmationModal
          isOpen={visibilityModal.isOpen}
          title={visibilityModal.isCurrentlyVisible ? "Hide Product from Store?" : "Unhide Product?"}
          message={
            visibilityModal.isCurrentlyVisible
              ? `Are you sure you want to hide "${visibilityModal.title}" from the customer store? Customers will not be able to browse or purchase it until unhidden. Existing orders will not be affected.`
              : `Make "${visibilityModal.title}" visible in the customer store? Customers will be able to discover and purchase this product again.`
          }
          confirmLabel={visibilityModal.isCurrentlyVisible ? "Hide Product" : "Make Visible"}
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
