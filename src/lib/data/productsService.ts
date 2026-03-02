import { Product } from '@/types';
import { PRODUCTS } from './products';

// Simulated delay to mimic API call
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ProductsService {
  private products: Product[] = [...PRODUCTS];

  async getAllProducts(): Promise<Product[]> {
    await delay(300);
    return this.products;
  }

  async getProductById(id: number): Promise<Product | undefined> {
    await delay(200);
    return this.products.find(p => p.id === id);
  }

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    await delay(400);
    const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
    const newProduct = { ...productData, id: newId } as Product;
    this.products.push(newProduct);
    // In a real app, you'd persist to a file/db here
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    await delay(400);
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    await delay(400);
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length !== initialLength;
  }
}

export const productsService = new ProductsService();
