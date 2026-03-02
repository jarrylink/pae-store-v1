import React from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import Button from './Button';
import { Product } from '@/types';

interface AddToCartButtonProps {
  product: Product;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onAdd?: () => void; // Optional callback after adding
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  disabled = false,
  size = 'md',
  className = '',
  onAdd
}) => {
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (product && !disabled) {
      addItem(product);
      if (onAdd) {
        onAdd();
      }
    }
  };

  const isOutOfStock = disabled || !product?.inStock;
  const buttonText = isOutOfStock ? 'Out of Stock' : 'Add to Cart';

  return (
    <Button
      variant="primary"
      size={size}
      disabled={isOutOfStock}
      onClick={handleAddToCart}
      className={`w-full ${className}`}
    >
      {buttonText}
    </Button>
  );
};

export default AddToCartButton;
