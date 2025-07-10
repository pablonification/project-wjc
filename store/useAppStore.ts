import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Kegiatan, Berita, Dokumentasi } from '@/types';

const initialBeritaPagination = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Kegiatan State
      kegiatan: [],
      kegiatanLoading: false,
      kegiatanError: null,

      // Berita State
      berita: [],
      beritaLoading: false,
      beritaError: null,
      beritaPagination: initialBeritaPagination,

      // Dokumentasi State
      dokumentasi: [],
      dokumentasiLoading: false,
      dokumentasiError: null,

      // Kegiatan Actions
      setKegiatan: (kegiatan: Kegiatan[]) =>
        set({ kegiatan, kegiatanError: null }),

      setKegiatanLoading: (kegiatanLoading: boolean) =>
        set({ kegiatanLoading }),

      setKegiatanError: (kegiatanError: string | null) =>
        set({ kegiatanError, kegiatanLoading: false }),

      // Berita Actions
      setBerita: (berita: Berita[]) =>
        set({ berita, beritaError: null }),

      setBeritaLoading: (beritaLoading: boolean) =>
        set({ beritaLoading }),

      setBeritaError: (beritaError: string | null) =>
        set({ beritaError, beritaLoading: false }),

      setBeritaPagination: (beritaPagination: AppState['beritaPagination']) =>
        set({ beritaPagination }),

      // Dokumentasi Actions
      setDokumentasi: (dokumentasi: Dokumentasi[]) =>
        set({ dokumentasi, dokumentasiError: null }),

      setDokumentasiLoading: (dokumentasiLoading: boolean) =>
        set({ dokumentasiLoading }),

      setDokumentasiError: (dokumentasiError: string | null) =>
        set({ dokumentasiError, dokumentasiLoading: false }),

      // Utility Actions
      clearErrors: () =>
        set({
          kegiatanError: null,
          beritaError: null,
          dokumentasiError: null,
        }),

      resetState: () =>
        set({
          kegiatan: [],
          kegiatanLoading: false,
          kegiatanError: null,
          berita: [],
          beritaLoading: false,
          beritaError: null,
          beritaPagination: initialBeritaPagination,
          dokumentasi: [],
          dokumentasiLoading: false,
          dokumentasiError: null,
        }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => {
        // Check if we're in a browser environment
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      // Only persist data, not loading/error states
      partialize: (state) => ({
        kegiatan: state.kegiatan,
        berita: state.berita,
        beritaPagination: state.beritaPagination,
        dokumentasi: state.dokumentasi,
      }),
    }
  )
);