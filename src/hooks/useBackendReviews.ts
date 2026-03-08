import { useCallback, useEffect, useState } from 'react';
import { ApiError, BackendReview, getReviews } from '../lib/api';

type BackendReviewsState = {
  loading: boolean;
  ok: boolean;
  items: BackendReview[];
  error: string | null;
  statusCode: number | null;
  lastCheckedAt: string | null;
};

export function useBackendReviews() {
  const [state, setState] = useState<BackendReviewsState>({
    loading: false,
    ok: false,
    items: [],
    error: null,
    statusCode: null,
    lastCheckedAt: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const items = await getReviews();
      setState({
        loading: false,
        ok: true,
        items,
        error: null,
        statusCode: 200,
        lastCheckedAt: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setState({
        loading: false,
        ok: false,
        items: [],
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
