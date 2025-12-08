import { createContext, use, useCallback, useSyncExternalStore } from "react";

type StorageContext = ReturnType<typeof createStorage>;
export const StorageContext = createContext<StorageContext | null>(null);
StorageContext.displayName = "StorageContext";

export function createStorage() {
  type Subscribers = Set<(value: unknown, key: string) => void>;

  const subscribers: Record<string, Subscribers> = {};
  const globalSubscribers: Subscribers = new Set();

  const storage: Record<string, unknown> = {};

  return {
    getValue: (key: string) => storage[key],
    hasValue: (key: string) => key in storage,

    setValue: (key: string, value: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      value = typeof value === "function" ? value(storage[key]) : value;
      if (storage[key] === value) return;
      storage[key] = value;
      subscribers[key]?.forEach((callback) => callback(value, key));
      globalSubscribers.forEach((callback) => callback(value, key));
    },

    subscribe: (
      callback: (value: unknown, key: string) => void,
      key?: string,
    ) => {
      if (key === undefined) {
        globalSubscribers.add(callback);
        return () => globalSubscribers.delete(callback);
      }
      subscribers[key] ??= new Set();
      subscribers[key].add(callback);
      return () => subscribers[key]?.delete(callback);
    },
  };
}

export function useStorage<T>(key: string, initialValue: T | (() => T)) {
  const storage = use(StorageContext);
  if (!storage) throw new Error("Missing StorageProvider");

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => storage.setValue(key, value),
    [key, storage],
  );

  if (!storage.hasValue(key)) {
    storage.setValue(key, initialValue);
  }

  const value = useSyncExternalStore(
    (callback) => storage.subscribe(callback, key),
    () => storage.getValue(key) as T,
  );
  return [value, setValue] as const;
}
