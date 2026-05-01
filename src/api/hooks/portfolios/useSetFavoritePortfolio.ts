import { useMutation } from '@apollo/client/react';
import { SetFavoritePortfolioDocument, GetPortfoliosDocument } from '@/api/generated/graphql';
import { getGraphQLError } from '@/api/client';

export const useSetFavoritePortfolio = () => {
  const [mutate, { loading, error }] = useMutation(SetFavoritePortfolioDocument, {
    refetchQueries: [{ query: GetPortfoliosDocument }],
  });

  const setFavorite = (portfolioId: number | null) => mutate({ variables: { portfolioId } });

  return { setFavorite, loading, error: getGraphQLError(error) };
};
