// Apollo Client — single instance used for all GraphQL communication in the app.
//
// Mounted at the root in main.tsx via <ApolloProvider client={apolloClient}>,
// which makes it available to every component through Apollo hooks (useQuery, useMutation).
//
// Link chain (runs in order for every GraphQL request):
//
//   authLink → httpLink
//
//   authLink: reads the JWT from Zustand (outside React, via .getState()) and injects
//             the Authorization header before the request is sent.
//             No token → sends an empty header (public queries still work).
//
//   httpLink: sends the GraphQL operation as POST /graphql.
//             In development, Vite proxies /graphql → http://localhost:3001/graphql.
//             In production, the reverse proxy (nginx, etc.) handles the routing.
//
// InMemoryCache: stores query results in memory. If the same query is made twice
//                with the same variables, Apollo returns the cached result without
//                making a new network request.
import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client'
import { useAuthStore } from '@/stores/auth.store'

const httpLink = createHttpLink({
  uri: '/graphql', // proxied to backend; change to full URL if needed
})

const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().token
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  })
  return forward(operation)
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})
