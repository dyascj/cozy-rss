import { create } from "zustand";

export type SearchScope = "all" | "current";

interface SearchState {
  query: string;
  isSearchActive: boolean;
  searchScope: SearchScope;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setSearchActive: (active: boolean) => void;
  setSearchScope: (scope: SearchScope) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState & SearchActions>()((set) => ({
  query: "",
  isSearchActive: false,
  searchScope: "all",

  setQuery: (query) => set({ query }),

  setSearchActive: (isSearchActive) => set({ isSearchActive }),

  setSearchScope: (searchScope) => set({ searchScope }),

  clearSearch: () => set({ query: "", isSearchActive: false }),
}));
