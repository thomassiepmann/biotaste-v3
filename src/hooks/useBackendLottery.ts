import { useCallback, useEffect, useState } from 'react';
import {
  ApiError,
  BackendLotteryStatus,
  EnterLotteryResponse,
  enterLottery,
  getLotteryStatus,
} from '../lib/api';

type BackendLotteryState = {
  loading: boolean;
  submitting: boolean;
  ok: boolean;
  data: BackendLotteryStatus | null;
  submitResult: EnterLotteryResponse | null;
  error: string | null;
  statusCode: number | null;
  lastCheckedAt: string | null;
};

export function useBackendLottery() {
  const [state, setState] = useState<BackendLotteryState>({
    loading: false,
    submitting: false,
    ok: false,
    data: null,
    submitResult: null,
    error: null,
    statusCode: null,
    lastCheckedAt: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getLotteryStatus();
      setState((prev) => ({
        ...prev,
        loading: false,
        ok: true,
        data,
        error: null,
        statusCode: 200,
        lastCheckedAt: new Date().toISOString(),
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setState((prev) => ({
        ...prev,
        loading: false,
        ok: false,
        data: null,
        error: message,
        statusCode: error instanceof ApiError ? error.status : null,
        lastCheckedAt: new Date().toISOString(),
      }));
    }
  }, []);

  const submitEntry = useCallback(async () => {
    setState((prev) => ({ ...prev, submitting: true, error: null }));

    try {
      const submitResult = await enterLottery();
      setState((prev) => ({
        ...prev,
        submitting: false,
        submitResult,
        error: null,
      }));
      await refresh();
      return submitResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      setState((prev) => ({
        ...prev,
        submitting: false,
        submitResult: null,
        error: message,
      }));
      throw error;
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    ...state,
    refresh,
    submitEntry,
  };
}
