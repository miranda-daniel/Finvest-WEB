import { useQueryClient } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

interface QuoteResponse {
  symbol: string;
  price: number;
}

export const useInstrumentQuote = () => {
  const queryClient = useQueryClient();

  const fetchQuote = async (symbol: string): Promise<number | null> => {
    try {
      const data = await queryClient.fetchQuery<QuoteResponse>({
        queryKey: ['instrument-quote', symbol],
        queryFn: () =>
          apiClient.get<QuoteResponse>(`/instruments/quote/${symbol}`).then((r) => r.data),
        staleTime: 30_000,
      });
      return data.price;
    } catch (err) {
      console.error('Failed to fetch quote:', getApiError(err));
      return null;
    }
  };

  return { fetchQuote };
};
