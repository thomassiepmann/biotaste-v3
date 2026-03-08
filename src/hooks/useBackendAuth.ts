import { useCallback, useEffect, useState } from 'react';
import { ApiError, BackendAuthStatus, getAuthStatus } from '../lib/api';

type BackendAuthState = {
  loading: boolean;
  ok: boolean;
  data: BackendAuthStatus | null;
  error: string | null;
  statusCode: number | null;
  lastCheckedAt: string | null;
};

export function useBackendAuth() {
  const [state, setState] = useState<BackendAuthState>({
    loading: false,
    ok: false,
    data: null,
    error: null,
    statusCode: null,
    lastCheckedAt: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getAuthStatus();
      setState({
        loading: false,
        ok: true,
        data,
        error: null,
        statusCode: 200,
        lastCheckedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setState({
        loading: false,
        ok: false,
        data: null,
        error: message,
        statusCode: error instanceof ApiError ? error.status : null,
        lastCheckedAt: new Date().toISOString(),
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
