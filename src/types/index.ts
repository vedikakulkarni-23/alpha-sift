export interface Company {
  id: string;
  name: string;
  website: string;
  description: string;
  sector: string;
  stage: string;
  location: string;
  founded: number;
  employees: string;
  funding: string;
  logo: string;
  tags: string[];
  notes: string[];
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: {
    sector?: string;
    stage?: string;
    location?: string;
  };
  createdAt: string;
  resultCount: number;
}

export interface CompanyList {
  id: string;
  name: string;
  description: string;
  companyIds: string[];
  createdAt: string;
  updatedAt: string;
}
