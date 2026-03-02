import { create } from 'zustand';

interface SearchState {
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  clearFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  selectedCategory: 'all',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  clearFilters: () => set({ searchQuery: '', selectedCategory: 'all' }),
}));
