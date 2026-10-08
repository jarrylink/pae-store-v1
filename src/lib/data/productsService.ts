import { Product } from '@/types';
import { catalogRequest } from './catalogRequest';

const API_URL = '/api/products';

export const productsService = {
  getAllProducts(includeInactive = false): Promise<Product[]> {
    const url = includeInactive ? `${API_URL}?active=false` : API_URL;
    return catalogRequest<Product[]>(url);
  },
  toggleProductStatus(id: number, isActive: boolean): Promise<Product> {
    return catalogRequest<Product>(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
  },
  async getProductById(id: number): Promise<Product | null> {
    const response = await fetch(API_URL + '/' + id, { cache: 'no-store' });
    if (response.status === 404) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) throw new Error(data?.error || 'Failed to fetch product');
    return data;
  },
  createProduct(product: Partial<Product>): Promise<Product> {
    return catalogRequest<Product>(API_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
    });
  },
  updateProduct(id: number, product: Partial<Product>): Promise<Product> {
    return catalogRequest<Product>(API_URL + '/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product),
    });
  },
  async deleteProduct(id: number): Promise<boolean> {
    await catalogRequest(API_URL + '/' + id, { method: 'DELETE' });
    return true;
  },
};
