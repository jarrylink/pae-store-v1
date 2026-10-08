export interface Product {
  id: number;
  title: string;
  brand: string;
  spec: string;
  price: number;
  purchasePrice?: number;
  vendorPrice?: number;
  image: string;
  category: string;
  warranty: string;
  installationTime?: string;
  capacity?: string;
  compatibleWith?: string[];
  features?: string[];
  inStock: boolean;
  inventory: number;
  systemType?: string;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
  type?: 'product' | 'service' | 'accessory';
  serviceId?: number;
  accessoryId?: number;
  productId?: number;
  unit?: string;
}

// Add other exports as needed...









