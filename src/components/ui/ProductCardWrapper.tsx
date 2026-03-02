'use client';

import React from 'react';
import ProductCard from './cards/ProductCard';
import { Product } from '@/types';
import { useAuthStore } from '@/lib/stores/authStore';

interface ProductCardWrapperProps {
  product: Product;
  onAddToCart: (productId: number) => void;
  onViewDetails: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
  isInWishlist?: (productId: number) => boolean;
  onRequireLogin?: () => void;
}

const ProductCardWrapper: React.FC<ProductCardWrapperProps> = ({
  product,
  onAddToCart,
  onViewDetails,
  onAddToWishlist,
  isInWishlist,
  onRequireLogin
}) => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <ProductCard
      product={product}
      onAddToCart={onAddToCart}
      onViewDetails={onViewDetails}
      onAddToWishlist={onAddToWishlist}
      isInWishlist={isInWishlist}
      userRole={user?.role as any}
      isAuthenticated={isAuthenticated}
      onRequireLogin={onRequireLogin}
    />
  );
};

export default ProductCardWrapper;
