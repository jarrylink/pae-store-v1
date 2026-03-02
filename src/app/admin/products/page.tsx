'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productsService } from '@/lib/data/productsService';
import { Product } from '@/types';
import ProductForm from '@/components/admin/ProductForm';
import {
  Plus, Search, Filter, Edit, Trash2, Eye, Download, Upload,
  Grid, List, RefreshCw, Check, X, MoreVertical, BarChart3,
  Package, Tag, DollarSign, Battery, Shield, Clock
} from 'lucide-react';

export default function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productsService.getAllProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      
      const uniqueCategories = ['all', ...Array.from(new Set(fetchedProducts.map(p => p.category)))];
      setCategories(uniqueCategories);
      
      calculateStats(fetchedProducts);
      
      setSuccessMessage(`Loaded ${fetchedProducts.length} products successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (productsList: Product[]) => {
    const total = productsList.length;
    const inStock = productsList.filter(p => p.inStock).length;
    const lowStock = productsList.filter(p => p.inventory < 10 && p.inventory > 0).length;
    const outOfStock = productsList.filter(p => !p.inStock || p.inventory === 0).length;
    const totalValue = productsList.reduce((sum, p) => sum + (p.price * p.inventory), 0);
    
    setStats({ total, inStock, lowStock, outOfStock, totalValue });
  };

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

    setFilteredProducts(results);
    calculateStats(results);
  }, [products, searchQuery, selectedCategory]);

  const handleAddProduct = async (productData: any) => {
    setSaving(true);
    setError(null);
    try {
      const newProduct = await productsService.createProduct(productData);
      await loadProducts();
      setShowProductForm(false);
      setSuccessMessage(`Product "${newProduct.title}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to create product:', error);
      setError('Failed to create product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    setSaving(true);
    setError(null);
    try {
      const updatedProduct = await productsService.updateProduct(editingProduct.id, productData);
      await loadProducts();
      setEditingProduct(null);
      setShowProductForm(false);
      setSuccessMessage(`Product "${updatedProduct.title}" updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update product:', error);
      setError('Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setSaving(true);
    setError(null);
    try {
      const success = await productsService.deleteProduct(productId);
      
      if (success) {
        await loadProducts();
        setSelectedProducts(prev => prev.filter(id => id !== productId));
        setSuccessMessage('Product deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      setError('Failed to delete product. Please try again.');
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
      const deletePromises = selectedProducts.map(id => productsService.deleteProduct(id));
      await Promise.all(deletePromises);
      
      await loadProducts();
      setSelectedProducts([]);
      setSuccessMessage(`${selectedProducts.length} products deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete products:', error);
      setError('Failed to delete products. Please try again.');
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
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your store products, inventory, and pricing. All changes are saved to products.ts file.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadProducts()}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-400 flex items-center">
            <X className="w-5 h-5 mr-2" />
            {error}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-400 flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {successMessage}
          </p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Products</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <Package className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">In Stock</p>
              <p className="text-2xl font-bold mt-1">{stats.inStock}</p>
            </div>
            <Check className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Low Stock</p>
              <p className="text-2xl font-bold mt-1">{stats.lowStock}</p>
            </div>
            <Battery className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Out of Stock</p>
              <p className="text-2xl font-bold mt-1">{stats.outOfStock}</p>
            </div>
            <X className="w-8 h-8 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Total Value</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name, brand, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'grid' | 'table')}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
              >
                <option value="grid">Grid View</option>
                <option value="table">Table View</option>
              </select>
            </div>
          </div>

          {/* View Toggle and Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {selectedProducts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={saving}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedProducts.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <ProductForm
              product={editingProduct || undefined}
              onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
              onCancel={() => {
                setShowProductForm(false);
                setEditingProduct(null);
              }}
              isSubmitting={saving}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1a2a8a] mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Reading from products.ts file</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory !== 'all' 
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
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-[#1a2a8a] dark:text-green-500 focus:ring-[#1a2a8a] dark:focus:ring-green-500"
                  />
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.inventory, product.inStock)}`}>
                    {getStockStatusText(product.inventory, product.inStock)}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand} • {product.category}</p>
                  </div>
                  <span className="text-lg font-bold text-[#1a2a8a] dark:text-green-400">
                    {formatCurrency(product.price)}
                  </span>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">{product.spec}</p>

                {/* Stats */}
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

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(product.id)}
                    className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#1a2a8a] dark:text-green-500 focus:ring-[#1a2a8a] dark:focus:ring-green-500"
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
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#1a2a8a] dark:text-green-500 focus:ring-[#1a2a8a] dark:focus:ring-green-500"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(product.price)}
                      </span>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(product.inventory, product.inStock)}`}>
                        {getStockStatusText(product.inventory, product.inStock)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
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

      {/* Pagination/Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> of{' '}
          <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span> products
          {searchQuery && (
            <span> for "<span className="font-semibold text-gray-900 dark:text-white">{searchQuery}</span>"</span>
          )}
        </div>
        <div className="text-sm">
          <span className="text-gray-900 dark:text-white font-medium">Data Source:</span>{' '}
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">src/lib/data/products.ts</code>
          <span className="ml-3">All changes saved to file</span>
        </div>
      </div>
    </div>
  );
}
