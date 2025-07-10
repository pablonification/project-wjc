import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/lib/api-client';
import { Kegiatan, KegiatanFilters } from '@/types';

export const useKegiatan = (filters?: KegiatanFilters) => {
  const {
    kegiatan,
    kegiatanLoading,
    kegiatanError,
    setKegiatan,
    setKegiatanLoading,
    setKegiatanError,
  } = useAppStore();

  const fetchKegiatan = async (refresh = false) => {
    if (kegiatanLoading) return;
    
    // If we have cached data and not refreshing, use it
    if (kegiatan.length > 0 && !refresh && !filters) {
      return;
    }

    setKegiatanLoading(true);
    setKegiatanError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      if (filters?.category) {
        params.append('category', filters.category);
      }
      
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await apiClient.get(`/api/kegiatan?${params.toString()}`);
      
      if (response.data.success) {
        setKegiatan(response.data.data);
      } else {
        setKegiatanError(response.data.error || 'Failed to fetch kegiatan');
      }
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      setKegiatanError(error instanceof Error ? error.message : 'Failed to fetch kegiatan');
    } finally {
      setKegiatanLoading(false);
    }
  };

  const getKegiatanBySlug = async (slug: string): Promise<Kegiatan | null> => {
    try {
      const response = await apiClient.get(`/api/kegiatan/${slug}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching kegiatan by slug:', error);
      return null;
    }
  };

  const registerForKegiatan = async (slug: string, formData: any) => {
    try {
      const response = await apiClient.post(`/api/kegiatan/${slug}/register`, formData);
      return response.data;
    } catch (error) {
      console.error('Error registering for kegiatan:', error);
      throw error;
    }
  };

  // Auto-fetch on mount if no data and no filters
  useEffect(() => {
    if (kegiatan.length === 0 && !kegiatanLoading && !filters) {
      fetchKegiatan();
    }
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (filters) {
      fetchKegiatan(true);
    }
  }, [filters]);

  return {
    kegiatan,
    loading: kegiatanLoading,
    error: kegiatanError,
    fetchKegiatan,
    getKegiatanBySlug,
    registerForKegiatan,
    refetch: () => fetchKegiatan(true),
  };
};