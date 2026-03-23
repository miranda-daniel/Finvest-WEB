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
