import { useRef, useState } from "react";

export function useAsyncSequential<T, Args extends unknown[]>(
  promise: (...args: Args) => Promise<T>,
  onResolve?: (data: Awaited<T>, synced: boolean) => void,
) {
  const [, _rerender] = useState(0);
  const rerender = () => {
    _rerender((i) => i + 1);
  };

  const stateRef = useRef({ loading: false, data: undefined as T | undefined });
  const setState = (value: Partial<typeof stateRef.current>) => {
    Object.assign(stateRef.current, value);
    rerender();
  };

  const argsRef = useRef<Args>(undefined);

  async function run() {
    const args = argsRef.current;
    if (!args) return stateRef.current.data as T;
    argsRef.current = undefined;
    const data = await promise(...args);
    onResolve?.(data, !argsRef.current);
    setState({ loading: !!argsRef.current, data });
    return run();
  }

  function trigger(...args: Args) {
    argsRef.current = args;
    if (stateRef.current.loading) return;

    setState({ loading: true });
    return run();
  }

  return [stateRef.current, trigger] as const;
}

export function useAsyncSequentialCallback<T, Args extends unknown[]>(
  promise: (...args: Args) => Promise<T>,
  onResolve?: (data: Awaited<T>, synced: boolean) => void,
) {
  const stateRef = useRef({ loading: false, data: undefined as T | undefined });

  const argsRef = useRef<Args>(undefined);

  async function run() {
    const args = argsRef.current;
    if (!args) return stateRef.current.data as T;
    argsRef.current = undefined;
    const data = await promise(...args);
    onResolve?.(data, !argsRef.current);
    stateRef.current = { loading: !!argsRef.current, data };
    return run();
  }

  function trigger(...args: Args) {
    argsRef.current = args;
    if (stateRef.current.loading) return;

    stateRef.current.loading = true;
    return run();
  }

  return trigger;
}

export function createAsyncSequential<T, Args extends unknown[]>(
  promise: (...args: Args) => Promise<T>,
  onResolve?: (data: Awaited<T>, synced: boolean) => void,
) {
  const state = { loading: false, data: undefined as T | undefined };

  let argsRef = undefined as Args | undefined;

  async function run() {
    const args = argsRef;
    if (!args) return state.data as T;
    argsRef = undefined;
    const data = await promise(...args);
    onResolve?.(data, !argsRef);
    state.loading = !!argsRef;
    state.data = data;
    return run();
  }

  async function trigger(...args: Args) {
    argsRef = args;
    if (state.loading) return;

    state.loading = true;
    return run();
  }

  return trigger;
}
