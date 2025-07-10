import useSWR from "swr";
import { IBerita } from "@/models/Berita";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBerita(page: number = 1) {
  const { data, error, isLoading } = useSWR<{ data: IBerita[]; total: number }>(
    `/api/berita?page=${page}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  return {
    berita: data?.data || [],
    total: data?.total || 0,
    isLoading,
    isError: error,
  };
}