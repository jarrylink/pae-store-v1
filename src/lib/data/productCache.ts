import { Product } from "@/types";

// Use different variable names to avoid conflict with export
let cacheData: Product[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const productCache = {
  get: () => {
    if (cacheData && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return cacheData;
    }
    return null;
  },
  
  set: (products: Product[]) => {
    cacheData = products;
    cacheTimestamp = Date.now();
  },
  
  clear: () => {
    cacheData = null;
    cacheTimestamp = 0;
  }
};
