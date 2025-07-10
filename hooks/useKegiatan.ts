import useSWR from "swr";
import { IKegiatan } from "@/models/Kegiatan";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useKegiatan() {
  const { data, error, isLoading } = useSWR<IKegiatan[]>("/api/kegiatan", fetcher, {
    revalidateOnFocus: false,
  });
  return {
    kegiatan: data || [],
    isLoading,
    isError: error,
  };
}