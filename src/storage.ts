import {
  createContext,
  createElement,
  use,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

export type StorageContext = ReturnType<typeof createStorage>;
export const StorageContext = createContext<StorageContext | null>(null);
StorageContext.displayName = "StorageContext";

export function createStorage() {
  type Subscribers = Set<(value: unknown, key: string) => void>;

  const subscribers: Record<string, Subscribers> = {};
  const globalSubscribers: Subscribers = new Set();

  const storage: Record<string, unknown> = {};

  return {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    getValue: <T = unknown>(key: string) => storage[key] as T | undefined,
    hasValue: (key: string) => key in storage,

    setValue: (key: string, value: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      value = typeof value === "function" ? value(storage[key]) : value;
      if (storage[key] === value) return;
      storage[key] = value;
      if (value === undefined) delete storage[key];
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

export function StorageProvider({
  buster,
  children,
}: {
  buster: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = useState(createStorage);
  useEffect(() => {
    setValue(createStorage());
  }, [buster]);
  return createElement(StorageContext, { value, children });
}

export function useStorage<T>(
  _key: string | string[],
  initialValue: T,
  init = true,
) {
  const key = typeof _key === "string" ? _key : _key.join("-"); // TODO find a better way to handle array keys
  const storage = use(StorageContext);
  if (!storage) throw new Error("Missing StorageProvider");

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => storage.setValue(key, value),
    [key, storage],
  );

  if (!storage.hasValue(key) && init) {
    storage.setValue(key, initialValue);
  }

  const _value = useSyncExternalStore(
    (callback) => storage.subscribe(callback, key),
    () => storage.getValue(key) as T,
  );

  const value = storage.hasValue(key) ? _value : initialValue;
  return [value, setValue] as const;
}
