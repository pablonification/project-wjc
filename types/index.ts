// Common Types
export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatoCMSRecord {
  id: string;
  _status: 'draft' | 'published';
  _firstPublishedAt: string;
  _publishedAt: string;
  _createdAt: string;
  _updatedAt: string;
}

// Kegiatan Types
export interface Kegiatan extends BaseDocument {
  title: string;
  description: string;
  content?: string;
  slug: string;
  startDate: Date;
  endDate: Date;
  location: string;
  status: 'Mendatang' | 'Sedang Berlangsung' | 'Selesai';
  registrationDeadline?: Date;
  maxParticipants?: number;
  currentParticipants: number;
  image?: string;
  category?: string;
  isActive: boolean;
  datoId?: string;
}

export interface KegiatanFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  accessCode: string;
  terms: boolean;
}

export interface Registration extends BaseDocument {
  kegiatanId: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  accessCode?: string;
}

// Berita Types
export interface Berita extends BaseDocument {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: string;
  publishDate: Date;
  category: string;
  image?: string;
  isPublished: boolean;
  tags: string[];
  datoId?: string;
}

// Dokumentasi Types
export interface Dokumentasi extends BaseDocument {
  title: string;
  description: string;
  year: number;
  type: 'document' | 'video' | 'image' | 'link';
  url: string;
  fileSize?: string;
  category?: string;
  isPublic: boolean;
  datoId?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// DatoCMS Query Types
export interface DatoCMSKegiatan extends DatoCMSRecord {
  title: string;
  description: string;
  content?: string;
  slug: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  image?: {
    url: string;
    alt?: string;
  };
  category?: string;
}

export interface DatoCMSBerita extends DatoCMSRecord {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  author: string;
  publishDate: string;
  category: string;
  image?: {
    url: string;
    alt?: string;
  };
  tags: string[];
}

export interface DatoCMSDokumentasi extends DatoCMSRecord {
  title: string;
  description: string;
  year: number;
  type: string;
  url: string;
  fileSize?: string;
  category?: string;
}

// State Management Types
export interface AppState {
  // Kegiatan
  kegiatan: Kegiatan[];
  kegiatanLoading: boolean;
  kegiatanError: string | null;
  
  // Berita
  berita: Berita[];
  beritaLoading: boolean;
  beritaError: string | null;
  beritaPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Dokumentasi
  dokumentasi: Dokumentasi[];
  dokumentasiLoading: boolean;
  dokumentasiError: string | null;
  
  // Actions
  setKegiatan: (kegiatan: Kegiatan[]) => void;
  setKegiatanLoading: (loading: boolean) => void;
  setKegiatanError: (error: string | null) => void;
  
  setBerita: (berita: Berita[]) => void;
  setBeritaLoading: (loading: boolean) => void;
  setBeritaError: (error: string | null) => void;
  setBeritaPagination: (pagination: AppState['beritaPagination']) => void;
  
  setDokumentasi: (dokumentasi: Dokumentasi[]) => void;
  setDokumentasiLoading: (loading: boolean) => void;
  setDokumentasiError: (error: string | null) => void;
  
  // Utility actions
  clearErrors: () => void;
  resetState: () => void;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Filter and Search Types
export interface KegiatanFilters {
  status?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BeritaFilters {
  category?: string;
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface SearchParams {
  query?: string;
  filters?: KegiatanFilters | BeritaFilters;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  pagination?: {
    page: number;
    limit: number;
  };
}