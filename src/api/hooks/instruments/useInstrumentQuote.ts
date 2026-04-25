import { useQuery } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

interface QuoteResponse {
  symbol: string;
  price: number;
}

export const useInstrumentQuote = (symbol: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['instrument-quote', symbol],
    queryFn: () =>
      apiClient
        .get<QuoteResponse>(`/instruments/quote/${symbol}`)
        .then((r) => r.data),
    enabled: false,
    staleTime: 30_000,
  });

  return {
    price: data?.price ?? null,
    loading: isLoading,
    error: getApiError(error),
    fetchQuote: refetch,
  };
};
