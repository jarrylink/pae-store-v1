// User types - Updated to match our database exactly
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    emailVerified: boolean;
    phone?: string;
    role: 'superadmin' | 'admin' | 'staff' | 'customer';
    company?: string;
    location?: string;
    bio?: string;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string | null;
    isActive: boolean;
    permissions?: string[];
}

// Authentication data types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface GoogleUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

// Address types
export interface Address {
  id: string;
  userId: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
  isDefault: boolean;
}

// Order types
export interface ProductLine {
  id?: number;
  orderId?: number;
  productId: number;
  name?: string;
  title: string;
  brand?: string;
  spec?: string;
  capacity?: string;
  price: number;
  quantity: number;
  image?: string;
  type: 'product';
  lineItemId?: string;
}

export interface AccessoryLine {
  id?: number;
  orderId?: number;
  accessoryId: number;
  name: string;
  title?: string;
  price?: number;
  unit_price: number;
  quantity: number;
  total_price: number;
  unit?: string;
  image?: string;
  type?: 'accessory';
  sku?: string;
  category?: string;
}

export interface ServiceLine {
  id?: number;
  orderId?: number;
  serviceId: number;
  productId?: number;
  name: string;
  title?: string;
  price: number;
  quantity: number;
  type: 'service';
  image?: string;
  description?: string;
  category?: string;
  lineItemId?: string;
}

export type OrderLineItem = ProductLine | AccessoryLine | ServiceLine;

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId?: number;
  serviceId?: number;
  accessoryId?: number;
  name?: string;
  title?: string;
  brand?: string;
  spec?: string;
  capacity?: string;
  price: number;
  quantity: number;
  image?: string;
  type?: 'product' | 'service' | 'accessory';
  lineItemId?: string;
  unit_price?: number;
  total_price?: number;
  unit?: string;
  category?: string;
}

export interface Order {
  id: number;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  products?: ProductLine[];
  accessories?: AccessoryLine[];
  services?: ServiceLine[];
  productTotal?: number;
  accessoryTotal?: number;
  serviceTotal?: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: 'saved' | 'pending' | 'confirmed' | 'pending_agent' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address | null;
  billingAddress: Address | null;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
  actualDelivery?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  // Service tracking
  serviceId?: number | null;
  serviceName?: string | null;
  servicePrice?: number | string | null;
  hasService?: boolean;
}

// Cart types
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Wishlist types
export interface WishlistItem {
  id: string;
  productId: number;
  addedAt: string;
}

// Authentication data types - keeping both for compatibility
export interface LoginCredentials {
  email: string;
  password: string;
}









export type UserProfile = User;




export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category?: string;
  duration?: string;
  isActive: boolean;
  image?: string;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}


export interface Accessory {
  id: number;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category?: string;
  duration?: string;
  isActive: boolean;
  image?: string;
  features?: string[];
  createdAt: string;
  sku?: string;
  unit?: string;
  stock: number;
}
