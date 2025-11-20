import { createContext, use } from "react";

import type { useOperation } from "#openapi/context";

export const defaultValues = {
  serverIdx: 0,
  proxy: false,

  selected: [] as string[],
  // params
  query: {} as Record<string, unknown>,
  header: {} as Record<string, unknown>,
  path: {} as Record<string, unknown>,
  cookie: {} as Record<string, unknown>,

  body: undefined as unknown,
};
export const FormContext = createContext({
  ...defaultValues,
  setState: ((v: typeof defaultValues) => void v) as React.Dispatch<
    React.SetStateAction<typeof defaultValues>
  >,
});
FormContext.displayName = "OperationPlaygroundFormContext";

export function useFormContext() {
  return use(FormContext);
}

function flattenWithBrackets(name: string, obj: unknown): [string, unknown][] {
  if (typeof obj !== "object" || obj === null) {
    return [[name, obj]];
  }
  return Object.entries(obj).flatMap(([k, v]) =>
    flattenWithBrackets(name ? `${name}[${k}]` : k, v),
  );
}

function serializeQueryParams(
  params: Record<string, unknown>,
  selected: string[],
) {
  params = Object.fromEntries(
    Object.entries(params).filter(([k]) =>
      selected.includes(["query", k].join(".")),
    ),
  );

  const query = flattenWithBrackets("", params)
    .filter(([, v]) => v !== undefined)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");

  return query && `?${query}`;
}

function substitutePathParams(path: string, params: Record<string, unknown>) {
  Object.entries(params).forEach(([k, v]) => {
    path = path.replaceAll(`{${k}}`, encodeURIComponent(String(v)));
  });
  return path;
}

export function createRequest(
  d: typeof defaultValues,
  o: ReturnType<typeof useOperation>,
  contentType: string | undefined,
) {
  let base = o.servers.at(d.serverIdx)?.url ?? window.origin;
  if (base.endsWith("/")) {
    base = base.slice(0, -1);
  }
  if (base.startsWith("/")) {
    base = window.origin + base;
  }
  const path = substitutePathParams(o.pathname, d.path);
  const url = base + path + serializeQueryParams(d.query, d.selected);

  const token = (o.security ?? [])
    .flatMap((s) => Object.keys(s))
    .map((k) => localStorage.getItem(k))
    .find((k) => !!k);

  const headers: Record<string, string> = token
    ? { Authorization: `Bearer ${JSON.parse(token)}` }
    : {};

  if (contentType && d.body !== undefined) {
    headers["Content-Type"] = contentType;
  }

  const body = d.body === undefined ? undefined : JSON.stringify(d.body);
  return { url, method: o.method.toUpperCase(), body, headers };
}
