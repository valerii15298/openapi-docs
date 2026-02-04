import type { Json } from "#types/types";

export function deepGet(obj: unknown, path: (string | number)[]) {
  return path.reduce((v: unknown, key) => v?.[key as keyof typeof v], obj);
}

export function resolveRef(ref: string, obj: object) {
  if (!ref.startsWith("#/")) {
    // eslint-disable-next-line no-console
    console.error("Only local references are supported");
    return undefined;
  }

  const path = ref
    .slice(2)
    .split("/")
    .map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));

  return deepGet(obj, path);
}

export function deepSet(
  obj: Json | undefined,
  path: (string | number)[],
  value: Json,
): Json {
  if (path.length === 0) return value;

  const [key, ...rest] = path;
  if (key === undefined) return value;

  if (typeof obj !== "object" || obj === null) {
    obj = typeof key === "string" ? {} : [];
  }

  if (Array.isArray(obj)) {
    const newArr = [...obj];
    const k = key as `${number}`;
    newArr[k] = deepSet(newArr[k], rest, value);
    return newArr;
  }

  return { ...obj, [key]: deepSet(obj[key], rest, value) };
}

export function Enum<Key extends string>(...keys: Key[]) {
  return keys.reduce(
    (acc, key) => ({ ...acc, [key]: key }),
    {} as { [K in Key]: K },
  );
}
