// Apollo Client — single instance used for all GraphQL communication in the app.
//
// Mounted at the root in main.tsx via <ApolloProvider client={apolloClient}>,
// which makes it available to every component through Apollo hooks (useQuery, useMutation).
//
// Link chain (runs in order for every GraphQL request):
//
//   authLink → refreshLink → httpLink
//
//   authLink:    reads the JWT from Zustand (outside React, via .getState()) and injects
//                the Authorization header before the request is sent.
//                No token → sends an empty header (public queries still work).
//
//   refreshLink: intercepts TOKEN_EXPIRED GraphQL errors. Calls silentRefresh(), which
//                serializes all concurrent refresh attempts into a single HTTP request
//                (see src/api/silentRefresh.ts). On success, retries the original
//                operation with the new token. On failure, clears auth state and
//                redirects to /login.
//
//   httpLink:    sends the GraphQL operation as POST /api/graphql.
//                In development, Vite proxies /api/* → http://localhost:3001.
//                In production, the ALB or reverse proxy handles the routing.
//
// InMemoryCache: stores query results in memory. If the same query is made twice
//                with the same variables, Apollo returns the cached result without
//                making a new network request.
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { ErrorLink, type ErrorLink as ErrorLinkType } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Observable } from '@apollo/client';
import { useAuthStore } from '@/stores/auth.store';
import { silentRefresh } from '@/api/silentRefresh';

const httpLink = new HttpLink({
  uri: '/api/graphql',
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().token;
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
  return forward(operation);
});

const retryOperation = (
  operation: ErrorLinkType.ErrorHandlerOptions['operation'],
  forward: ErrorLinkType.ErrorHandlerOptions['forward'],
  token: string,
) => {
  operation.setContext({
    headers: { authorization: `Bearer ${token}` },
  });
  return forward(operation);
};

const refreshLink = new ErrorLink(({ error, operation, forward }) => {
  const isTokenExpired =
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === 'TOKEN_EXPIRED');

  if (!isTokenExpired) return;

  // silentRefresh() serializes concurrent calls — multiple TOKEN_EXPIRED errors
  // firing at the same time will all wait on the same in-flight request.
  return new Observable((observer) => {
    silentRefresh()
      .then((jwtToken: string) => {
        retryOperation(operation, forward, jwtToken).subscribe(observer);
      })
      .catch((err: unknown) => {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
        observer.error(err);
      });
  });
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, refreshLink, httpLink]),
  cache: new InMemoryCache(),
});
