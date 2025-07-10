import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/lib/api-client';
import { Berita, BeritaFilters } from '@/types';

export const useBerita = (filters?: BeritaFilters, page?: number) => {
  const {
    berita,
    beritaLoading,
    beritaError,
    beritaPagination,
    setBerita,
    setBeritaLoading,
    setBeritaError,
    setBeritaPagination,
  } = useAppStore();

  const fetchBerita = async (pageNum = 1, refresh = false) => {
    if (beritaLoading) return;
    
    // If we have cached data for page 1 and not refreshing, use it
    if (berita.length > 0 && pageNum === 1 && !refresh && !filters) {
      return;
    }

    setBeritaLoading(true);
    setBeritaError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', beritaPagination.limit.toString());
      
      if (filters?.category) {
        params.append('category', filters.category);
      }
      
      if (filters?.author) {
        params.append('author', filters.author);
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','));
      }
      
      if (filters?.dateRange) {
        params.append('startDate', filters.dateRange.start.toISOString());
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      const response = await apiClient.get(`/api/berita?${params.toString()}`);
      
      if (response.data.success) {
        // For pagination, append or replace data
        if (pageNum === 1) {
          setBerita(response.data.data);
        } else {
          setBerita([...berita, ...response.data.data]);
        }
        
        setBeritaPagination(response.data.pagination);
      } else {
        setBeritaError(response.data.error || 'Failed to fetch berita');
      }
    } catch (error) {
      console.error('Error fetching berita:', error);
      setBeritaError(error instanceof Error ? error.message : 'Failed to fetch berita');
    } finally {
      setBeritaLoading(false);
    }
  };

  const getBeritaBySlug = async (slug: string): Promise<Berita | null> => {
    try {
      const response = await apiClient.get(`/api/berita/${slug}`);
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('Error fetching berita by slug:', error);
      return null;
    }
  };

  const searchBerita = async (query: string) => {
    setBeritaLoading(true);
    setBeritaError(null);

    try {
      const response = await apiClient.get(`/api/berita/search?q=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        setBerita(response.data.data);
        setBeritaPagination(response.data.pagination);
      } else {
        setBeritaError(response.data.error || 'Failed to search berita');
      }
    } catch (error) {
      console.error('Error searching berita:', error);
      setBeritaError(error instanceof Error ? error.message : 'Failed to search berita');
    } finally {
      setBeritaLoading(false);
    }
  };

  const loadMore = () => {
    if (beritaPagination.page < beritaPagination.totalPages && !beritaLoading) {
      fetchBerita(beritaPagination.page + 1);
    }
  };

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (berita.length === 0 && !beritaLoading && !filters) {
      fetchBerita(1);
    }
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (filters) {
      fetchBerita(1, true);
    }
  }, [filters]);

  // Handle page changes
  useEffect(() => {
    if (page && page !== beritaPagination.page) {
      fetchBerita(page);
    }
  }, [page]);

  return {
    berita,
    loading: beritaLoading,
    error: beritaError,
    pagination: beritaPagination,
    fetchBerita,
    getBeritaBySlug,
    searchBerita,
    loadMore,
    hasMore: beritaPagination.page < beritaPagination.totalPages,
    refetch: () => fetchBerita(1, true),
  };
};