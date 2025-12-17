import { createContext, use, useCallback, useSyncExternalStore } from "react";

export type StorageContext = ReturnType<typeof createStorage>;
export const StorageContext = createContext<StorageContext | null>(null);
StorageContext.displayName = "StorageContext";

/**
 * Creates a simple in-memory key-value store with subscription support.
 *
 * The returned store lets callers read and write values by string key,
 * react to changes for a specific key or all keys, and query key presence.
 *
 * @returns An object with the following methods:
 * - `getValue<T>(key)` — returns the stored value for `key` typed as `T` or `undefined`.
 * - `hasValue(key)` — returns `true` if `key` exists in the store.
 * - `setValue(key, value)` — updates the value for `key`. `value` may be a function that receives the current value and returns the new value; setting `undefined` removes the key. Notifies subscribers for the key and all global subscribers with `(value, key)`.
 * - `subscribe(callback, key?)` — subscribes `callback` to changes. If `key` is omitted the callback is invoked for all key changes; if `key` is provided the callback is invoked only for that key. Returns an unsubscribe function.
 */
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

/**
 * Accesses a named value in shared storage and returns the current value with a setter.
 *
 * @param _key - The storage key, either a string or an array of strings (array keys are joined with `-` to derive a single key).
 * @param initialValue - The value used to initialize the storage when the key is absent and returned when storage has no value.
 * @param init - If `true`, writes `initialValue` into storage when the key is not present; if `false`, does not initialize storage.
 * @returns A tuple `[value, setValue]` where `value` is the stored value (or `initialValue` when the key is not present) and `setValue` updates the stored value for the key.
 * @throws Error - Throws "Missing StorageProvider" when no StorageContext is available.
 */
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