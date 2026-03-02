import { useAuthStore } from '@/lib/stores/authStore';

export function useCheckoutGuard() {
  const { user, isAuthenticated } = useAuthStore();

  /**
   * Check if user can proceed to checkout
   */
  const canProceedToCheckout = (): {
    allowed: boolean;
    reason?: string;
    action?: 'login' | 'register' | 'proceed';
  } => {
    // Admin users cannot checkout
    if (user?.role === 'superadmin' || user?.role === 'staff') {
      return {
        allowed: false,
        reason: 'Admin users cannot make purchases. Please use a customer account.',
        action: undefined
      };
    }

    // Guests need to login/register
    if (!isAuthenticated) {
      return {
        allowed: false,
        reason: 'Please login or create an account to complete your purchase.',
        action: 'login'
      };
    }

    // Customers can proceed
    if (user?.role === 'customer') {
      return {
        allowed: true,
        action: 'proceed'
      };
    }

    // Default deny
    return {
      allowed: false,
      reason: 'Unable to process checkout.',
      action: undefined
    };
  };

  /**
   * Validate cart items before checkout
   */
  const validateCartForCheckout = (cartItems: any[]): {
    valid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (!cartItems || cartItems.length === 0) {
      errors.push('Your cart is empty');
    }

    // Check for out of stock items
    cartItems.forEach(item => {
      if (item.inStock === false) {
        errors.push(`"${item.name}" is out of stock`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  };

  /**
   * Get checkout requirements
   */
  const getCheckoutRequirements = (): {
    requiresLogin: boolean;
    requiresCustomerAccount: boolean;
    requiresShippingAddress: boolean;
    requiresPaymentMethod: boolean;
  } => {
    return {
      requiresLogin: !isAuthenticated,
      requiresCustomerAccount: isAuthenticated && (user?.role === 'superadmin' || user?.role === 'staff'),
      requiresShippingAddress: true,
      requiresPaymentMethod: true
    };
  };

  return {
    canProceedToCheckout,
    validateCartForCheckout,
    getCheckoutRequirements
  };
}
