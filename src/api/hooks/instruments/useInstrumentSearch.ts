import { useQuery } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

export interface InstrumentSearchResponse {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  country: string;
}

export const useInstrumentSearch = (query: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['instrument-search', query],
    queryFn: () =>
      apiClient
        .get<InstrumentSearchResponse[]>('/instruments/search', { params: { q: query } })
        .then((r) => r.data),
    enabled: query.trim().length >= 1,
    staleTime: 60_000,
  });

  return {
    results: data ?? [],
    loading: isLoading,
    error: getApiError(error),
  };
};
