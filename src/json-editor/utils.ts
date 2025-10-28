export function deepGet(obj: unknown, path: (string | number)[]) {
  return path.reduce(
    (current: unknown, key) => current?.[key as keyof typeof current],
    obj,
  );
}

export function deepSet(obj: unknown, path: string[], value: unknown): unknown {
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  if (key === undefined) return value;

  if (typeof obj !== "object" || obj === null) {
    if (typeof key === "number") {
      obj = [];
    } else {
      obj = {};
    }
  }

  if (Array.isArray(obj)) {
    const newArr = [...(obj as unknown[])];
    const k = key as `${number}`;
    newArr[k] = deepSet(newArr[k], rest, value);
    return newArr;
  }

  return {
    ...(obj as object),
    [key]: deepSet((obj as Record<string, unknown>)[key], rest, value),
  };
}

export function Enum<Key extends string>(...keys: Key[]) {
  return keys.reduce(
    (acc, key) => ({ ...acc, [key]: key }),
    {} as { [K in Key]: K },
  );
}

export function preventDoubleClick(event: React.MouseEvent<HTMLElement>) {
  if (!event.defaultPrevented && event.detail > 1) {
    event.preventDefault();
  }
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function tryCatch<T, Err>(fn: () => T) {
  try {
    return [fn(), undefined] as const;
  } catch (error) {
    return [undefined, error as Err] as const;
  }
}

export async function tryCatchAsync<T, Err>(fn: () => PromiseLike<T>) {
  try {
    return [await fn(), undefined] as const;
  } catch (error) {
    return [undefined, error as Err] as const;
  }
}
