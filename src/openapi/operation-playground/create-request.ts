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

export function useParams() {
  const o = useOperation();
  const key = [...o.path, K.parameters];
  return useStorage(key, defaultParams);
}

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

function substitutePathParams(path: string, params: Record<string, Param>) {
  Object.entries(params).forEach(([k, v]) => {
    path = path.replaceAll(`{${k}}`, encodeURIComponent(v.value)); // TODO path parameters serialization
  });
  return path;
}

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
