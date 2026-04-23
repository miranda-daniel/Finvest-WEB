import { useMutation } from '@apollo/client/react';
import {
  CreatePortfolioDocument,
  GetPortfoliosDocument,
} from '@/api/generated/graphql';

export const useCreatePortfolio = (onSuccess: () => void) => {
  const [mutate, { loading, error }] = useMutation(CreatePortfolioDocument, {
    refetchQueries: [{ query: GetPortfoliosDocument }],
    onCompleted: () => onSuccess(),
  });

  const submit = (name: string, description: string | undefined, isFavorite: boolean) =>
    mutate({ variables: { name, description, isFavorite } });

  return { submit, loading, error };
};
