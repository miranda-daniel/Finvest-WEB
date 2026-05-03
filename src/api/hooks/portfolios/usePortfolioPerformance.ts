import { useQuery } from '@apollo/client/react';
import {
  GetPortfolioPerformanceDocument,
  PortfolioRange,
} from '@/api/generated/graphql';
import { getGraphQLError } from '@/api/client';

export { PortfolioRange };

export const usePortfolioPerformance = (portfolioId: number, range: PortfolioRange) => {
  const { data, loading, error } = useQuery(GetPortfolioPerformanceDocument, {
    variables: { portfolioId, range },
  });

  return {
    points: data?.portfolioPerformance ?? [],
    loading,
    error: getGraphQLError(error),
  };
};
