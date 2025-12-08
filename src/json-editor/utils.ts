export function deepGet(obj: unknown, path: string[]) {
  return path.reduce((v: unknown, key) => v?.[key as keyof typeof v], obj);
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function resolveRef<T = unknown>(ref: string, obj: object) {
  if (!ref.startsWith("#/")) {
    // eslint-disable-next-line no-console
    console.error("Only local references are supported");
    return undefined;
  }

  const path = ref
    .slice(2)
    .split("/")
    .map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));

  return deepGet(obj, path) as T;
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
