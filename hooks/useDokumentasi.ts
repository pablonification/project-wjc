import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/lib/api-client';
import { Dokumentasi } from '@/types';

export const useDokumentasi = (year?: number, type?: string) => {
  const {
    dokumentasi,
    dokumentasiLoading,
    dokumentasiError,
    setDokumentasi,
    setDokumentasiLoading,
    setDokumentasiError,
  } = useAppStore();

  const fetchDokumentasi = async (refresh = false) => {
    if (dokumentasiLoading) return;
    
    // If we have cached data and not refreshing, use it
    if (dokumentasi.length > 0 && !refresh && !year && !type) {
      return;
    }

    setDokumentasiLoading(true);
    setDokumentasiError(null);

    try {
      const params = new URLSearchParams();
      
      if (year) {
        params.append('year', year.toString());
      }
      
      if (type) {
        params.append('type', type);
      }

      const response = await apiClient.get(`/api/dokumentasi?${params.toString()}`);
      
      if (response.data.success) {
        setDokumentasi(response.data.data);
      } else {
        setDokumentasiError(response.data.error || 'Failed to fetch dokumentasi');
      }
    } catch (error) {
      console.error('Error fetching dokumentasi:', error);
      setDokumentasiError(error instanceof Error ? error.message : 'Failed to fetch dokumentasi');
    } finally {
      setDokumentasiLoading(false);
    }
  };

  const getAvailableYears = async (): Promise<number[]> => {
    try {
      const response = await apiClient.get('/api/dokumentasi/years');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching available years:', error);
      return [];
    }
  };

  const getDokumentasiByYear = (targetYear: number) => {
    return dokumentasi.filter(doc => doc.year === targetYear);
  };

  const getDokumentasiByType = (targetType: string) => {
    return dokumentasi.filter(doc => doc.type === targetType);
  };

  const getGroupedByYear = () => {
    const grouped = dokumentasi.reduce((acc, doc) => {
      if (!acc[doc.year]) {
        acc[doc.year] = [];
      }
      acc[doc.year].push(doc);
      return acc;
    }, {} as Record<number, Dokumentasi[]>);

    // Sort years in descending order
    const sortedYears = Object.keys(grouped)
      .map(Number)
      .sort((a, b) => b - a);

    return sortedYears.map(year => ({
      year,
      items: grouped[year].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    }));
  };

  // Auto-fetch on mount if no data and no filters
  useEffect(() => {
    if (dokumentasi.length === 0 && !dokumentasiLoading && !year && !type) {
      fetchDokumentasi();
    }
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (year || type) {
      fetchDokumentasi(true);
    }
  }, [year, type]);

  return {
    dokumentasi,
    loading: dokumentasiLoading,
    error: dokumentasiError,
    fetchDokumentasi,
    getAvailableYears,
    getDokumentasiByYear,
    getDokumentasiByType,
    getGroupedByYear,
    refetch: () => fetchDokumentasi(true),
  };
};