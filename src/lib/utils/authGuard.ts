import { useAuthStore } from '@/lib/stores/authStore';

export interface AddToCartOptions {
  requireLogin?: boolean;
  showLoginModal?: () => void;
  onSuccess?: () => void;
  onRequireLogin?: () => void;
}

export function useCartAuthGuard() {
  const { user, isAuthenticated } = useAuthStore();

  const isAdminUser = user?.role === 'superadmin' || user?.role === 'staff';
  const isCustomer = user?.role === 'customer';
  const isGuest = !isAuthenticated;

  /**
   * Check if user can add to cart based on their role
   */
  const canAddToCart = (): boolean => {
    // Admin users cannot add to cart
    if (isAdminUser) {
      return false;
    }
    
    // Customers and guests can add to cart
    return true;
  };

  /**
   * Get the appropriate action for product interaction
   */
  const getProductAction = (): {
    label: string;
    action: 'addToCart' | 'viewDetails' | 'loginRequired';
    disabled: boolean;
  } => {
    if (isAdminUser) {
      return {
        label: 'View Details',
        action: 'viewDetails',
        disabled: false
      };
    }

    if (isGuest) {
      return {
        label: 'Add to Cart',
        action: 'loginRequired',
        disabled: false
      };
    }

    return {
      label: 'Add to Cart',
      action: 'addToCart',
      disabled: false
    };
  };

  /**
   * Handle product action with proper auth flow
   */
  const handleProductAction = (
    product: any,
    options: AddToCartOptions = {}
  ): boolean => {
    const { requireLogin = true, showLoginModal, onSuccess, onRequireLogin } = options;
    const productAction = getProductAction();

    switch (productAction.action) {
      case 'viewDetails':
        // For admin users, navigate to product details
        window.location.href = `/products/${product.id}`;
        return true;

      case 'loginRequired':
        // For guests, show login modal if required
        if (requireLogin) {
          if (showLoginModal) {
            showLoginModal();
          }
          if (onRequireLogin) {
            onRequireLogin();
          }
          return false;
        }
        // If login not required, allow add to cart
        if (onSuccess) onSuccess();
        return true;

      case 'addToCart':
        // For customers, proceed with add to cart
        if (onSuccess) onSuccess();
        return true;

      default:
        return false;
    }
  };

  return {
    canAddToCart,
    getProductAction,
    handleProductAction,
    isAdminUser,
    isCustomer,
    isGuest
  };
}
