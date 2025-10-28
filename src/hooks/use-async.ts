import { useEffect, useState } from "react";

export function useAsync<T>(promise: Promise<T>) {
  const [state, setState] = useState({
    loading: true,
    data: undefined as T | undefined,
    error: undefined as unknown,
  });

  useEffect(() => {
    let mounted = true;

    function onSuccess(data: T) {
      if (!mounted) return;
      setState({ loading: false, data, error: undefined });
    }

    function onError(error: unknown) {
      if (!mounted) return;
      setState((prev) => ({ ...prev, loading: false, error }));
    }

    promise.then(onSuccess, onError);

    return () => {
      mounted = false;
    };
  }, [promise]);

  return state;
}

export function useLazyAsync<T>(promise: () => Promise<T>) {
  const [state, setState] = useState({
    loading: false,
    data: undefined as T | undefined,
    error: undefined as unknown,
  });

  function onSuccess(data: T) {
    setState({ loading: false, data, error: undefined });
  }

  function onError(error: unknown) {
    setState((prev) => ({ ...prev, loading: false, error }));
  }

  function trigger() {
    setState((prev) => ({ ...prev, loading: true }));
    promise().then(onSuccess, onError);
  }

  return [state, trigger] as const;
}
