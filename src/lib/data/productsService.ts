import { Product } from "@/types";

const API_URL = "/api/products";

async function fetchWithRetry(url: string, options?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed, ${retries - i - 1} retries left`);
      if (i === retries - 1) throw error;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Max retries exceeded");
}

export const productsService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const res = await fetchWithRetry(API_URL);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch products");
      }
      
      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error in getAllProducts:", error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      const res = await fetchWithRetry(`${API_URL}/${id}`);
      
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch product");
      }
      
      return res.json();
    } catch (error) {
      console.error("Error in getProductById:", error);
      return null;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetchWithRetry(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create product");
      }

      return res.json();
    } catch (error) {
      console.error("Error in createProduct:", error);
      return null;
    }
  },

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetchWithRetry(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update product");
      }

      return res.json();
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return null;
    }
  },

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const res = await fetchWithRetry(`${API_URL}/${id}`, {
        method: "DELETE"
      });

      return res.ok;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      return false;
    }
  }
};
