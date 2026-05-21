export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: number;
  displayOrder: number;
  isActive: boolean;
}

class CategoryService {
  private cache: Category[] | null = null;
  
  async getAllCategories(): Promise<Category[]> {
    // Return cached categories if available
    if (this.cache !== null) {
      return this.cache;
    }
    
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      const categories: Category[] = data.categories || [];
      this.cache = categories;
      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return fallback categories
      const fallbackCategories: Category[] = [
        { id: 1, name: 'Solar Panels', slug: 'solar-panels', icon: '☀️', displayOrder: 1, isActive: true },
        { id: 2, name: 'Inverters', slug: 'inverters', icon: '⚡', displayOrder: 2, isActive: true },
        { id: 3, name: 'Batteries', slug: 'batteries', icon: '🔋', displayOrder: 3, isActive: true },
        { id: 4, name: 'ESS', slug: 'ess', icon: '🔋', displayOrder: 4, description: 'Energy Storage Systems', isActive: true },
        { id: 5, name: 'Street Light', slug: 'street-light', icon: '💡', displayOrder: 5, isActive: true },
        { id: 6, name: 'Accessories', slug: 'accessories', icon: '🔌', displayOrder: 6, isActive: true },
        { id: 7, name: 'Installation', slug: 'installation', icon: '🔧', displayOrder: 7, isActive: true }
      ];
      return fallbackCategories;
    }
  }
  
  clearCache(): void {
    this.cache = null;
  }
}

export const categoryService = new CategoryService();
