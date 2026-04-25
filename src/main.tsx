import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { router } from './router';
import { apolloClient } from '@/graphql/client';
import '@/index.css';

const queryClient = new QueryClient();

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    {/* QueryClientProvider — enables TanStack Query hooks (useQuery, useMutation) for REST requests */}
    <QueryClientProvider client={queryClient}>
      {/* ApolloProvider — enables Apollo hooks (useQuery, useMutation) for GraphQL requests */}
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
        {/* Toaster — renders toast notifications app-wide, use toast() from 'sonner' anywhere */}
        <Toaster theme="dark" position="bottom-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </ApolloProvider>
    </QueryClientProvider>
  </StrictMode>,
);
