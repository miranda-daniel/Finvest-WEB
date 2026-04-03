import { useQuery, gql } from '@apollo/client'

// The query document is defined inline here because graphql-codegen has not been run yet.
//
// Once codegen is run (`npm run codegen` with the API running), replace this block with:
//   import { GetUsersDocument, GetUsersQuery } from '@/api/generated'
//
// The .graphql source lives at: src/api/operations/users/getUsers.query.graphql
const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      firstName
      lastName
    }
  }
`

// User shape as defined in the GraphQL schema (src/graphql/schema/schema.ts in the API).
// Once codegen is run, delete this interface and import GetUsersQuery['users'][number] instead.
interface User {
  id: number
  email: string
  firstName: string
  lastName: string
}

// useUsers — fetches the full user list from the API via GraphQL.
//
// This hook is the only entry point components have to this data.
// Components must never call useQuery directly.
//
// Internally:
//   useQuery sends POST /graphql with the GetUsers operation
//   → Vite proxy forwards to localhost:3001/graphql
//   → Apollo Server resolves Query.users → UserService → UserRepository → PostgreSQL
//   → Apollo Client stores the result in InMemoryCache and re-renders the component
//
// Returns:
//   users   — User[] (empty array while loading or on error)
//   loading — true while the request is in flight
//   error   — ApolloError if the request failed, undefined otherwise
export function useUsers() {
  const { data, loading, error } = useQuery<{ users: User[] }>(GET_USERS)

  return {
    users: data?.users ?? [],
    loading,
    error,
  }
}
