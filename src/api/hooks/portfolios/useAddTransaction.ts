import { useMutation } from '@apollo/client/react';
import { AddTransactionDocument, GetPortfolioDetailDocument, OperationSide } from '@/api/generated/graphql';
import { getGraphQLError } from '@/api/client';

interface AddTransactionRequest {
  portfolioId: number;
  side: OperationSide;
  symbol: string;
  name: string;
  instrumentClass: string;
  date: string;
  price: number;
  quantity: number;
}

export const useAddTransaction = (portfolioId: number, onSuccess?: () => void) => {
  const [mutate, { loading, error }] = useMutation(AddTransactionDocument, {
    refetchQueries: [{ query: GetPortfolioDetailDocument, variables: { id: portfolioId } }],
    onCompleted: () => onSuccess?.(),
  });

  const submit = (input: AddTransactionRequest) =>
    new Promise<void>((resolve, reject) => {
      mutate({
        variables: input,
        onCompleted: () => resolve(),
        onError: (err) => reject(err),
      });
    });

  return { submit, loading, error: getGraphQLError(error) };
};
