import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(initialData: T | null = null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const get = useCallback(async (endpoint: string) => {
    setState({ data: null, loading: true, error: null });
    const result = await apiClient.get<T>(endpoint);
    if (result.error) {
      setState({ data: null, loading: false, error: result.error });
    } else {
      setState({ data: result.data || null, loading: false, error: null });
    }
  }, []);

  const post = useCallback(async (endpoint: string, body: any) => {
    setState({ data: null, loading: true, error: null });
    const result = await apiClient.post<T>(endpoint, body);
    if (result.error) {
      setState({ data: null, loading: false, error: result.error });
    } else {
      setState({ data: result.data || null, loading: false, error: null });
    }
  }, []);

  const put = useCallback(async (endpoint: string, body: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await apiClient.put<T>(endpoint, body);
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error }));
    } else {
      setState({ data: result.data || null, loading: false, error: null });
    }
  }, []);

  const remove = useCallback(async (endpoint: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const result = await apiClient.delete<T>(endpoint);
    if (result.error) {
      setState(prev => ({ ...prev, loading: false, error: result.error }));
    } else {
      setState({ data: null, loading: false, error: null });
    }
  }, []);

  return { ...state, get, post, put, remove };
}
