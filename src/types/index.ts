export interface ComponentSpec {
  name: string;
  value: string;
}

export interface Component {
  id: string;
  partNumber: string;
  manufacturer: string;
  type: string;
  package: string;
  packaging: string;
  stock: number;
  minStock: number;
  description: string;
  datasheetUrl: string;
  location: string;
  specs: ComponentSpec[];
}

export type ComponentFormData = Omit<Component, 'id'>;

export interface BOMItem {
  id: string;
  partNumber: string;
  manufacturer: string;
  required: number;
  available: number;
  location: string;
}

export interface PickingHistory {
  id: string;
  projectName: string;
  items: BOMItem[];
  completedAt: string;
  totalItems: number;
}

export type Theme = 'light' | 'dark' | 'system';

export type ViewType = 'inventory' | 'bom' | 'settings';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: keyof Component;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  type?: string;
  manufacturer?: string;
  lowStock?: boolean;
}
