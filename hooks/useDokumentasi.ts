import useSWR from "swr";
import { IDokumentasi } from "@/models/Dokumentasi";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDokumentasi() {
  const { data, error, isLoading } = useSWR<IDokumentasi[]>("/api/dokumentasi", fetcher);
  return {
    dokumentasi: data || [],
    isLoading,
    isError: error,
  };
}