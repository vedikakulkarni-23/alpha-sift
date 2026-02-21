import { create } from "zustand";
import { Company, SavedSearch, CompanyList } from "@/types";
import { companies as mockCompanies, initialSavedSearches, initialLists } from "@/data/mockData";

interface AppState {
  companies: Company[];
  lists: CompanyList[];
  savedSearches: SavedSearch[];
  
  // Company actions
  addNote: (companyId: string, note: string) => void;
  
  // List actions
  createList: (name: string, description: string) => void;
  deleteList: (listId: string) => void;
  addToList: (listId: string, companyId: string) => void;
  removeFromList: (listId: string, companyId: string) => void;
  
  // Saved search actions
  saveSearch: (search: Omit<SavedSearch, "id">) => void;
  deleteSearch: (searchId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  companies: mockCompanies,
  lists: initialLists,
  savedSearches: initialSavedSearches,

  addNote: (companyId, note) =>
    set((state) => ({
      companies: state.companies.map((c) =>
        c.id === companyId ? { ...c, notes: [...c.notes, note] } : c
      ),
    })),

  createList: (name, description) =>
    set((state) => ({
      lists: [
        ...state.lists,
        {
          id: String(Date.now()),
          name,
          description,
          companyIds: [],
          createdAt: new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
        },
      ],
    })),

  deleteList: (listId) =>
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== listId),
    })),

  addToList: (listId, companyId) =>
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId && !l.companyIds.includes(companyId)
          ? { ...l, companyIds: [...l.companyIds, companyId], updatedAt: new Date().toISOString().split("T")[0] }
          : l
      ),
    })),

  removeFromList: (listId, companyId) =>
    set((state) => ({
      lists: state.lists.map((l) =>
        l.id === listId
          ? { ...l, companyIds: l.companyIds.filter((id) => id !== companyId), updatedAt: new Date().toISOString().split("T")[0] }
          : l
      ),
    })),

  saveSearch: (search) =>
    set((state) => ({
      savedSearches: [
        ...state.savedSearches,
        { ...search, id: String(Date.now()) },
      ],
    })),

  deleteSearch: (searchId) =>
    set((state) => ({
      savedSearches: state.savedSearches.filter((s) => s.id !== searchId),
    })),
}));
