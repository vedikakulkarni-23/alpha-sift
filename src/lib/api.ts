import { supabase } from "@/integrations/supabase/client";

export interface DbCompany {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  sector: string | null;
  stage: string | null;
  location: string | null;
  founded: number | null;
  employees: string | null;
  funding: string | null;
  logo: string | null;
  tags: string[] | null;
  created_at: string;
}

export interface DbNote {
  id: string;
  company_id: string;
  content: string;
  created_at: string;
}

export interface DbList {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbListItem {
  id: string;
  list_id: string;
  company_id: string;
  added_at: string;
}

export interface DbSavedSearch {
  id: string;
  name: string;
  query: string | null;
  filters: Record<string, string> | null;
  result_count: number | null;
  created_at: string;
}

// Companies
export const fetchCompanies = async (): Promise<DbCompany[]> => {
  const { data, error } = await supabase.from("companies").select("*").order("name");
  if (error) throw error;
  return data as DbCompany[];
};

export const insertCompany = async (company: Omit<DbCompany, "id" | "created_at">): Promise<DbCompany> => {
  const { data, error } = await supabase.from("companies").insert(company).select().single();
  if (error) throw error;
  return data as DbCompany;
};

// Notes
export const fetchNotes = async (companyId: string): Promise<DbNote[]> => {
  const { data, error } = await supabase.from("company_notes").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
  if (error) throw error;
  return data as DbNote[];
};

export const insertNote = async (companyId: string, content: string): Promise<DbNote> => {
  const { data, error } = await supabase.from("company_notes").insert({ company_id: companyId, content }).select().single();
  if (error) throw error;
  return data as DbNote;
};

// Lists
export const fetchLists = async (): Promise<DbList[]> => {
  const { data, error } = await supabase.from("company_lists").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as DbList[];
};

export const createList = async (name: string, description: string): Promise<DbList> => {
  const { data, error } = await supabase.from("company_lists").insert({ name, description }).select().single();
  if (error) throw error;
  return data as DbList;
};

export const deleteList = async (id: string) => {
  const { error } = await supabase.from("company_lists").delete().eq("id", id);
  if (error) throw error;
};

// List items
export const fetchListItems = async (listId: string): Promise<DbListItem[]> => {
  const { data, error } = await supabase.from("company_list_items").select("*").eq("list_id", listId);
  if (error) throw error;
  return data as DbListItem[];
};

export const fetchAllListItems = async (): Promise<DbListItem[]> => {
  const { data, error } = await supabase.from("company_list_items").select("*");
  if (error) throw error;
  return data as DbListItem[];
};

export const addToList = async (listId: string, companyId: string) => {
  const { error } = await supabase.from("company_list_items").insert({ list_id: listId, company_id: companyId });
  if (error) throw error;
};

export const removeFromList = async (listId: string, companyId: string) => {
  const { error } = await supabase.from("company_list_items").delete().eq("list_id", listId).eq("company_id", companyId);
  if (error) throw error;
};

// Saved searches
export const fetchSavedSearches = async (): Promise<DbSavedSearch[]> => {
  const { data, error } = await supabase.from("saved_searches").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as DbSavedSearch[];
};

export const saveSearch = async (search: Omit<DbSavedSearch, "id" | "created_at">): Promise<DbSavedSearch> => {
  const { data, error } = await supabase.from("saved_searches").insert(search).select().single();
  if (error) throw error;
  return data as DbSavedSearch;
};

export const deleteSavedSearch = async (id: string) => {
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) throw error;
};
