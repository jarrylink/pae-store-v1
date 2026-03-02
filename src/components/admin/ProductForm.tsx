'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { X, Upload, Package, DollarSign, Tag, Hash, Shield, Battery, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const categories = [
  'Inverter',
  'Solar Panel', 
  'Battery',
  'Charge Controller',
  'Accessories',
  'Installation Kit',
  'Generator',
  'UPS'
];

const warranties = [
  '1 Year Warranty',
  '2 Years Warranty',
  '3 Years Warranty', 
  '5 Years Warranty',
  'Lifetime Warranty'
];

export default function ProductForm({ product, onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || '',
    brand: product?.brand || '',
    category: product?.category || 'Inverter',
    price: product?.price?.toString() || '0',
    inventory: product?.inventory?.toString() || '0',
    warranty: product?.warranty || '1 Year Warranty',
    spec: product?.spec || '',
    image: product?.image || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState(formData.image);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Product title is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.inventory || parseInt(formData.inventory) < 0) newErrors.inventory = 'Inventory cannot be negative';
    if (!formData.spec.trim()) newErrors.spec = 'Specifications are required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      inventory: parseInt(formData.inventory),
      inStock: parseInt(formData.inventory) > 0,
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
                className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent`}
                placeholder="e.g., Solar Inverter 5000W"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                className={`w-full px-4 py-2.5 border ${errors.brand ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent`}
                placeholder="e.g., Victron, Growatt, Huawei"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.brand}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as "Solar Panel" | "Inverter" | "Battery" | "Kit" | "Accessory" }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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
                {warranties.map((warranty) => (
                  <option key={warranty} value={warranty}>{warranty}</option>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (₦) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2.5 border ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent`}
                  placeholder="0"
                  min="0"
                  step="1000"
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inventory Quantity *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => setFormData(prev => ({ ...prev, inventory: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2.5 border ${errors.inventory ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent`}
                  placeholder="0"
                  min="0"
                />
              </div>
              {errors.inventory && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.inventory}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Image */}
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
                className={`w-full px-4 py-2.5 border ${errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent`}
                placeholder="https://example.com/product-image.jpg"
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.image}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Enter a valid image URL (jpg, png, webp)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image Preview
              </label>
              <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                    onError={() => setImagePreview('https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800')}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="w-16 h-16 text-gray-400" />
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
              className={`w-full px-4 py-2.5 border ${errors.spec ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a2a8a] focus:border-transparent`}
              placeholder="Enter detailed product specifications, features, and technical details..."
            />
            {errors.spec && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.spec}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Include key details like capacity, voltage, dimensions, features, etc.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-[#1a2a8a] to-[#40b553] text-white rounded-lg hover:from-[#0f1a66] hover:to-[#2e8b47] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                {product ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {product ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

