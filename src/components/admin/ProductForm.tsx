'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Upload, Package, DollarSign, Tag, Hash, Shield, Battery, AlertCircle, Loader2 } from 'lucide-react';
import { categoryService, Category } from '@/lib/services/categoryService';

interface ProductFormProps {
  product?: Product;
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const warranties = [
  '1 Year Warranty',
  '2 Years Warranty',
  '3 Years Warranty',
  '5 Years Warranty',
  'Lifetime Warranty'
];

export default function ProductForm({ product, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [formData, setFormData] = useState({
    title: product?.title || '',
    brand: product?.brand || '',
    category: product?.category || '',
    price: product?.price?.toString() || '0',
    purchasePrice: product?.purchasePrice?.toString() || '0',
    vendorPrice: product?.vendorPrice?.toString() || '0',
    inventory: product?.inventory?.toString() || '0',
    warranty: product?.warranty || '1 Year Warranty',
    spec: product?.spec || '',
    image: product?.image || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState(formData.image);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const cats = await categoryService.getAllCategories();
        setCategories(cats);
        if (!formData.category && cats.length > 0) {
          setFormData(prev => ({ ...prev, category: cats[0].name }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        const fallbackCategories = [
          { id: 1, name: 'Solar Panels', slug: 'solar-panels' },
          { id: 2, name: 'Inverters', slug: 'inverters' },
          { id: 3, name: 'Batteries', slug: 'batteries' },
          { id: 4, name: 'ESS', slug: 'ess' },
          { id: 5, name: 'Street Light', slug: 'street-light' },
          { id: 6, name: 'Accessories', slug: 'accessories' },
          { id: 7, name: 'Installation', slug: 'installation' }
        ] as Category[];
        setCategories(fallbackCategories);
        if (!formData.category && fallbackCategories.length > 0) {
          setFormData(prev => ({ ...prev, category: fallbackCategories[0].name }));
        }
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Product title is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.category) newErrors.category = 'Category is required';
    for (const field of ['price', 'purchasePrice', 'vendorPrice', 'inventory'] as const) {
      const value = Number(formData[field]);
      if (!formData[field].trim() || !Number.isInteger(value) || value < 0 || value > 2147483647) {
        newErrors[field] = 'Enter a non-negative whole number (maximum 2147483647)';
      }
    }
    if (Number(formData.price) <= 0) newErrors.price = 'Selling price must be greater than 0';
    if (!formData.spec.trim()) newErrors.spec = 'Specifications are required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      purchasePrice: parseFloat(formData.purchasePrice) || 0,
      vendorPrice: parseFloat(formData.vendorPrice) || 0,
      inventory: parseInt(formData.inventory),
      inStock: parseInt(formData.inventory) > 0,
      isActive: product ? (product.isActive !== undefined ? product.isActive : true) : true,
      ...(product ? {} : {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),
      ...(product && { updatedAt: new Date().toISOString() })
    };

    await onSubmit(productData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, image: url }));
    setImagePreview(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Details */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Product Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="e.g., Solar Inverter 5000W"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="e.g., Victron, Growatt, Huawei"
              />
              {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 px-4 py-2.5 border rounded-lg bg-gray-50">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              )}
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Warranty *
              </label>
              <select
                value={formData.warranty}
                onChange={(e) => setFormData(prev => ({ ...prev, warranty: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
              >
                {warranties.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selling Price (₦) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="0"
                min="0"
                
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Price (Cost) (₦)
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="0"
                min="0"
                
              />
              {errors.purchasePrice && <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>}
              <p className="mt-1 text-xs text-gray-500">What you paid to supplier</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendor Price (₦)
              </label>
              <input
                type="number"
                value={formData.vendorPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorPrice: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="0"
                min="0"
                
              />
              {errors.vendorPrice && <p className="mt-1 text-sm text-red-600">{errors.vendorPrice}</p>}
              <p className="mt-1 text-xs text-gray-500">Price quoted by vendor</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inventory Quantity *
              </label>
              <input
                type="number"
                value={formData.inventory}
                onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="0"
                min="0"
              />
              {errors.inventory && <p className="mt-1 text-sm text-red-600">{errors.inventory}</p>}
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Product Image
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL *
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Preview
              </label>
              <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {imagePreview ? (
  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
    <Package className="w-12 h-12 text-gray-400" />
  </div>
)}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Specifications
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product Specifications *
            </label>
            <textarea
              value={formData.spec}
              onChange={(e) => setFormData(prev => ({ ...prev, spec: e.target.value }))}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
              placeholder="Enter product specifications..."
            />
            {errors.spec && <p className="mt-1 text-sm text-red-600">{errors.spec}</p>}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (product ? 'Updating...' : 'Creating...') : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
}


