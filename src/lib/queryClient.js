/**
 * React Query Configuration
 *
 * Centralized caching and data fetching configuration for the application.
 * Provides smart caching, background refetching, and error handling.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create QueryClient with optimized defaults for ERP application
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 2 minutes
      staleTime: 2 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: 2,
      // Delay between retries (exponential backoff)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus for ERP (data is semi-static)
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect automatically
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// Re-export QueryClientProvider for convenience
export { QueryClientProvider };
