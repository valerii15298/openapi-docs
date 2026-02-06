import { useCallback } from "react";

import { K } from "#openapi/const";
import { useOperation } from "#openapi/context";
import { queryParam } from "#openapi/operation-playground/serialize-parameters";
import { useActiveRequestBody } from "#openapi/operation-playground/use-request-body";
import { useStorage } from "#storage";
import type { OpenAPIV3_1 } from "#types/index";

export type Param = {
  value: string;
  serialized?: string | undefined;
  include: boolean;
};

export type ParamIn = OpenAPIV3_1.ParameterIn;
type Params = Record<ParamIn, Record<string, Param>>;
const defaultParams: Params = {
  query: {},
  header: {},
  path: {},
  cookie: {},
  querystring: {},
};

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
  const setSerialized = (serialized: string | undefined) =>
    setParam({ ...param, serialized });
  const setValue = (value: string) => {
    // TODO handle other param.in types
    const serialized = p.in === "query" ? queryParam(p, value) : undefined;
    setParam({ ...param, value, serialized });
  };

  return [{ ...param, setInclude, setValue, setSerialized }, setParam] as const;
}

type Secret = { in: ParamIn; name: string; value: string } | undefined;
type Secrets = Record<string, Secret | undefined>;
export function useSecuritySchemes() {
  const path = [K.components, K.securitySchemes];
  return useStorage(path, {} as Secrets);
}

export function useSecurityScheme(name: string) {
  const [schemes, setSchemes] = useSecuritySchemes();
  const setScheme = useCallback(
    (secret: Secret | ((prev: Secret) => Secret)) =>
      setSchemes((s) => {
        const val = typeof secret === "function" ? secret(s[name]) : secret;
        return { ...s, [name]: val };
      }),
    [name, setSchemes],
  );

  return [schemes[name], setScheme] as const;
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
  return Object.entries(params).reduce(
    (p, [k, v]) => p.replaceAll(`{${k}}`, encodeURIComponent(v.value)),
    path,
  );
}

export function useRequestForm() {
  const [securitySchemes] = useSecuritySchemes();
  const secret = Object.values(securitySchemes).find((s) => s?.value);

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
    );
  if (secret?.in === "query") {
    query.push(
      `${encodeURIComponent(secret.name)}=${encodeURIComponent(secret.value)}`,
    );
  }

  const queryString = query.length ? `?${query.join("&")}` : "";
  const url = `${base + path}${queryString}`;

  const rawHeaders = Object.entries(d.header)
    .filter(([, v]) => v.include)
    .reduce(
      (acc, [name, { value }]) => (acc.append(name, value), acc),
      new Headers(),
    );
  if (secret?.in === "header") {
    rawHeaders.append(secret.name, secret.value);
  }

  const body = useActiveRequestBody();
  const headers = [...rawHeaders.entries()];

  return { url, method: o.method.toUpperCase(), body, headers };
}
