import { useQuery } from '@apollo/client/react';
import { GetPortfoliosDocument } from '@/api/generated/graphql';
import type { GetPortfoliosQuery } from '@/api/generated/graphql';

// usePortfolios — fetches the authenticated user's portfolios via GraphQL.
//
// This hook is the only entry point components have to portfolio data.
// Components must never call useQuery directly.
//
// The JWT is injected automatically by Apollo Client's authLink (src/graphql/client.ts),
// which reads the token from Zustand on every request.
//
// The API resolver will return an UNAUTHENTICATED error if no token is present.
// This hook should only be called from authenticated routes.
//
// Returns:
//   portfolios — Portfolio[] (empty array while loading or on error)
//   loading    — true while the request is in flight
//   error      — ApolloError if the request failed, undefined otherwise
export const usePortfolios = () => {
  const { data, loading, error } = useQuery<GetPortfoliosQuery>(GetPortfoliosDocument);

  return {
    portfolios: data?.portfolios ?? [],
    loading,
    error,
  };
};
