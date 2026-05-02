import { useQuery } from '@tanstack/react-query';
import { apiClient, getApiError } from '@/api/client';

type EodResponse = Record<string, number>;

export const useInstrumentBatchEod = (symbols: string[]) => {
  const key = [...symbols].sort().join(',');

  const { data, isLoading, error } = useQuery<EodResponse>({
    queryKey: ['instrument-batch-eod', key],
    queryFn: () =>
      apiClient.get<EodResponse>('/instruments/eod', { params: { symbols: key } }).then((r) => r.data),
    enabled: symbols.length > 0,
    staleTime: 60 * 60 * 1000, // EOD prices change once per day
  });

  return {
    eodPrices: data ?? {},
    loading: isLoading,
    error: error ? getApiError(error) : null,
  };
};
