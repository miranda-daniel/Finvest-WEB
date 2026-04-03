import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'

// TODO: Replace this manual document + types with the generated ones once the API
// exposes the `portfolios` field on the Query type and codegen succeeds.
// Expected generated imports (run `npm run codegen` after the API schema is updated):
//   import { GetPortfoliosDocument } from '@/api/generated/graphql'
//   import type { GetPortfoliosQuery } from '@/api/generated/graphql'

// Temporary manual document — mirrors getPortfolios.query.graphql exactly.
const GetPortfoliosDocument = gql`
  query GetPortfolios {
    portfolios {
      id
      name
      createdAt
    }
  }
`

// Temporary manual type — mirrors the shape the API will return.
// Replace with the generated GetPortfoliosQuery once codegen succeeds.
interface Portfolio {
  id: number
  name: string
  createdAt: string
}

interface GetPortfoliosQuery {
  portfolios: Portfolio[]
}

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
export function usePortfolios() {
  const { data, loading, error } = useQuery<GetPortfoliosQuery>(GetPortfoliosDocument)

  return {
    portfolios: data?.portfolios ?? [],
    loading,
    error,
  }
}
