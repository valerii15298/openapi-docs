import { useCallback } from "react";

import { K } from "#openapi/const";
import { useOperation } from "#openapi/context";
import { useActiveRequestBody } from "#openapi/operation-playground/use-request-body";
import { useStorage } from "#storage";

export type Param = {
  value: string;
  serialized?: string | undefined;
  include: boolean;
};

type ParamIn = "query" | "header" | "path" | "cookie";
type Params = Record<ParamIn, Record<string, Param>>;
const defaultParams: Params = { query: {}, header: {}, path: {}, cookie: {} };

/**
 * Provides persistent parameter state scoped to the current operation.
 *
 * @returns A tuple `[params, setParams]` where `params` is a mapping of `query`, `header`, `path`, and `cookie` parameter records and `setParams` updates the stored params; the storage is initialized with empty segments when absent.
 */
export function useParams() {
  const o = useOperation();
  const key = [...o.path, K.parameters];
  return useStorage(key, defaultParams);
}

/**
 * Accesses and manages a specific parameter within the operation-scoped Params store.
 *
 * @param p - Descriptor with `in` specifying the parameter location (`"query" | "header" | "path" | "cookie"`) and `name` the parameter key
 * @returns A readonly tuple where the first element is either `undefined` (if the parameter does not exist) or the parameter augmented with helpers: `setInclude` (update include flag), `setValue` (update value), and `setSerialized` (update serialized form); the second element is a setter that replaces the entire parameter
 */
export function useParam(p: { in: ParamIn; name: string }) {
  const [params, setParams] = useParams();
  const setParam = useCallback(
    (v: Param) => {
      setParams((ps) => ({
        ...ps,
        [p.in]: { ...ps[p.in], [p.name]: v },
      }));
    },
    [p.in, p.name, setParams],
  );
  const param = params[p.in][p.name];
  if (!param) return [undefined, setParam] as const;

  const setInclude = (include: boolean) => setParam({ ...param, include });
  const setValue = (value: string) => setParam({ ...param, value });
  const setSerialized = (serialized: string | undefined) =>
    setParam({ ...param, serialized });

  return [{ ...param, setInclude, setValue, setSerialized }, setParam] as const;
}

/**
 * Manage and expose the currently selected server for the active operation.
 *
 * @returns An object containing:
 *  - `idx`: the selected server index (0 by default)
 *  - `setIdx`: a setter to change the selected index
 *  - `server`: the server object at the selected index, or `undefined` if not available
 */
export function useServer() {
  const o = useOperation();
  const [idx, setIdx] = useStorage([...o.path, K.servers], 0);
  const server = o.servers[idx];
  return {
    idx,
    setIdx,
    server,
  };
}

/**
 * Substitutes path parameter placeholders in a path with the corresponding parameter values.
 *
 * @param path - Path template containing placeholders in the form `{name}`
 * @param params - Mapping from parameter name to `Param`; each parameter's `value` is used and percent-encoded when inserted
 * @returns The path with every `{name}` placeholder replaced by the corresponding parameter's encoded `value`
 */
function substitutePathParams(path: string, params: Record<string, Param>) {
  Object.entries(params).forEach(([k, v]) => {
    path = path.replaceAll(`{${k}}`, encodeURIComponent(v.value)); // TODO path parameters serialization
  });
  return path;
}

/**
 * Assemble request parameters (URL, method, body, and headers) for the current operation using selected server and stored parameter values.
 *
 * The returned `url` is built from the selected server URL (or window.origin), the operation pathname with path parameters substituted from stored path params, and a query string composed of query params marked `include` (using each param's `serialized` value when present, otherwise an encoded `key=value`). Trailing slashes on the base URL are removed and leading root-relative bases are resolved against window.origin.
 *
 * If the operation's security requirements reference a stored credential key found in localStorage, the returned `headers` include `Authorization: Bearer <token>` where `<token>` is the parsed value from localStorage; otherwise `headers` is empty. The returned `body` is taken from the active request body hook. `method` is the operation HTTP method in upper case.
 *
 * @returns An object with:
 * - `url` — fully constructed request URL including path and query string
 * - `method` — HTTP method in upper case
 * - `body` — the active request body value
 * - `headers` — request headers (may include an `Authorization` header when a stored credential is present)
 */
export function useRequestForm() {
  const { server } = useServer();
  const [d] = useParams();
  const o = useOperation();

  let base = server?.url ?? window.origin;
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  if (base.startsWith("/")) {
    base = window.origin + base;
  }
  const path = substitutePathParams(o.pathname, d.path);
  const query = Object.entries(d.query)
    .filter(([, v]) => v.include)
    .map(
      ([k, v]) =>
        v.serialized ??
        `${encodeURIComponent(k)}=${encodeURIComponent(v.value)}`,
    )
    .join("&");
  const queryString = query && `?${query}`;
  const url = `${base + path}${queryString}`;

  const token = (o.security ?? [])
    .flatMap((s) => Object.keys(s))
    .map((k) => localStorage.getItem(k))
    .find((k) => !!k);

  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${JSON.parse(token)}` }
    : {};

  const body = useActiveRequestBody();

  return { url, method: o.method.toUpperCase(), body, headers };
}