import type { Control } from "react-hook-form";

import type { useOperation } from "#openapi/context";

export const defaultValues = {
  serverIdx: 0,
  proxy: false,

  selected: [] as string[],
  query: {},
  header: {},
  path: {},
  cookie: {},

  body: undefined as unknown,
};
export const control = undefined as unknown as Control<typeof defaultValues>;

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
  { method, ...o }: ReturnType<typeof useOperation>,
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
  return { url, method, body, headers };
}
