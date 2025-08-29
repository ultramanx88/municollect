import { useState, useEffect, useCallback } from 'react';
import { ApiError, NetworkError } from '../lib/api-client';

// Generic hook state interface
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook options interface
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Generic hook for API calls with loading, error, and data state management
 */
export function useApi<T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(error as Error);
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for API calls that need to be executed with parameters
 */
export function useApiCallback<TParams extends any[], TResult = any>(
  apiCall: (...params: TParams) => Promise<TResult>,
  options: UseApiOptions = {}
) {
  const { onSuccess, onError } = options;
  
  const [state, setState] = useState<ApiState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...params: TParams) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall(...params);
      setState({ data, loading: false, error: null });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      onError?.(error as Error);
      throw error;
    }
  }, [apiCall, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export function useMutation<TParams extends any[], TResult = any>(
  mutationFn: (...params: TParams) => Promise<TResult>,
  options: UseApiOptions = {}
) {
  return useApiCallback(mutationFn, options);
}

/**
 * Hook for queries with automatic execution and optional refetching
 */
export function useQuery<T = any>(
  queryFn: () => Promise<T>,
  options: UseApiOptions & { 
    enabled?: boolean;
    refetchInterval?: number;
  } = {}
) {
  const { enabled = true, refetchInterval, ...apiOptions } = options;
  
  const result = useApi(queryFn, { 
    ...apiOptions, 
    immediate: enabled 
  });

  // Set up automatic refetching if specified
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      if (!result.loading) {
        result.execute();
      }
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, result.loading, result.execute]);

  return result;
}

/**
 * Extract user-friendly error message from various error types
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Hook for handling optimistic updates
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isOptimistic, setIsOptimistic] = useState(false);

  const update = useCallback(async (optimisticData: T) => {
    // Apply optimistic update immediately
    setData(optimisticData);
    setIsOptimistic(true);

    try {
      // Perform actual update
      const result = await updateFn(optimisticData);
      setData(result);
      setIsOptimistic(false);
      return result;
    } catch (error) {
      // Revert on error
      setData(initialData);
      setIsOptimistic(false);
      throw error;
    }
  }, [initialData, updateFn]);

  return {
    data,
    isOptimistic,
    update,
  };
}
