import { useState, useEffect } from 'react';
import type { Component, PickingHistory } from '@/types';
import { componentsApi, pickingApi } from '@/services/api';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useComponents(): UseAsyncState<Component[]> {
  const [data, setData] = useState<Component[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const components = await componentsApi.getAll();
      setData(components);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useComponent(id: string | undefined): UseAsyncState<Component> {
  const [data, setData] = useState<Component | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const component = await componentsApi.getById(id);
      if (!component) {
        setError('Component not found');
      } else {
        setData(component);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch component');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}

export function usePickingHistory(): UseAsyncState<PickingHistory[]> {
  const [data, setData] = useState<PickingHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await pickingApi.getHistory();
      setData(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch picking history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
