import { useCallback, useEffect, useState } from 'react';
import { getApiBaseUrl, getHealth, HealthResponse } from '../lib/api';

type BackendHealthState = {
  loading: boolean;
  ok: boolean;
  data: HealthResponse | null;
  error: string | null;
  lastCheckedAt: string | null;
  endpoint: string;
};

export function useBackendHealth() {
  const [state, setState] = useState<BackendHealthState>({
    loading: false,
    ok: false,
    data: null,
    error: null,
    lastCheckedAt: null,
    endpoint: getApiBaseUrl() || '(nicht gesetzt)',
  });

  const checkHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getHealth();
      setState({
        loading: false,
        ok: data.status === 'ok',
        data,
        error: null,
        lastCheckedAt: new Date().toISOString(),
        endpoint: getApiBaseUrl() || '(nicht gesetzt)',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setState({
        loading: false,
        ok: false,
        data: null,
        error: message,
        lastCheckedAt: new Date().toISOString(),
        endpoint: getApiBaseUrl() || '(nicht gesetzt)',
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    ...state,
    refresh: checkHealth,
  };
}
