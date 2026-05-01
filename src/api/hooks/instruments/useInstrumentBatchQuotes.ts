import { useQuery } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

type BatchQuotesResponse = Record<string, number>;

export const useInstrumentBatchQuotes = (symbols: string[]) => {
  const key = [...symbols].sort().join(',');

  const { data, isLoading, error } = useQuery<BatchQuotesResponse>({
    queryKey: ['instrument-batch-quotes', key],
    queryFn: () =>
      apiClient.get<BatchQuotesResponse>('/instruments/quotes', { params: { symbols: key } }).then((r) => r.data),
    enabled: symbols.length > 0,
    staleTime: 30_000,
  });

  return {
    quotes: data ?? {},
    loading: isLoading,
    error: error ? getApiError(error) : null,
  };
};
