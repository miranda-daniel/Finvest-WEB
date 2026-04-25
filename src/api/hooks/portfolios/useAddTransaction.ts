import { useMutation } from '@apollo/client/react';
import { AddTransactionDocument, GetPortfolioDetailDocument, OperationSide } from '@/api/generated/graphql';
import { getGraphQLError } from '@/api/client';

interface AddTransactionInput {
  portfolioId: number;
  side: OperationSide;
  symbol: string;
  name: string;
  instrumentClass: string;
  date: string;
  price: number;
  quantity: number;
}

export const useAddTransaction = (onSuccess?: () => void) => {
  const [mutate, { loading, error }] = useMutation(AddTransactionDocument, {
    refetchQueries: [GetPortfolioDetailDocument],
    onCompleted: () => onSuccess?.(),
  });

  const submit = (input: AddTransactionInput) => mutate({ variables: input });

  return { submit, loading, error: getGraphQLError(error) };
};
