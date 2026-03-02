export interface Product {
  id: number;
  title: string;
  brand: string;
  spec: string;
  price: number;
  image: string;
  category: "Solar Panel" | "Inverter" | "Battery" | "Kit" | "Accessory";
  warranty: string;
  installationTime?: string;
  capacity?: string;
  compatibleWith?: string[];
  features?: string[];
  inStock: boolean;
  inventory: number;
  systemType?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

// Add other exports as needed...


