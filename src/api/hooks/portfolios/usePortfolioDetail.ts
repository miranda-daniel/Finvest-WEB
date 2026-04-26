import { useQuery } from '@apollo/client/react';
import { GetPortfolioDetailDocument } from '@/api/generated/graphql';
import { getGraphQLError } from '@/api/client';

export const usePortfolioDetail = (portfolioId: number) => {
  const { data, loading, error } = useQuery(GetPortfolioDetailDocument, {
    variables: { id: portfolioId },
  });

  return {
    portfolio: data?.portfolioDetail ?? null,
    loading,
    error: getGraphQLError(error),
  };
};
