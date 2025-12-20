import type { OpenAPIV3, OpenAPIV3_1 } from "@scalar/openapi-types";
import { createContext, use, useCallback } from "react";

import { resolveRef } from "#json-editor/utils";
import { K } from "#openapi/const";
import type { ResponseResult } from "#openapi/operation-playground/response";
import { StorageContext, useStorage } from "#storage";

export interface OpenAPIContext {
  uri: string;
  doc: OpenAPIV3_1.Document;
  path: string[];
  setPath: (path: string[]) => void;
  setEditPath?: (path: string[]) => void;
}
export const OpenAPIContext = createContext<OpenAPIContext | null>(null);
OpenAPIContext.displayName = "OpenAPIContext";
const emptySchema = {};
export function useOpenAPI() {
  const ctx = use(OpenAPIContext);
  if (!ctx) throw new Error("useOpenAPI must be used within OpenAPIContext");
  const { doc } = ctx;
  type In = OpenAPIV3_1.ReferenceObject | OpenAPIV3.ReferenceObject | undefined;
  function resolveRefObj<T extends object>(
    obj: T | In,
  ): (T & { $ref?: string }) | undefined {
    if (obj && "$ref" in obj && obj.$ref) {
      const resolved = resolveRef<T>(obj.$ref, doc);
      if (!resolved) {
        // eslint-disable-next-line no-console
        console.error(`${obj.$ref} cannot be resolved`);
      }
      return { ...resolved!, ...obj, $ref: obj.$ref };
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return obj;
  }

  const extractSchema = useCallback(
    (schema?: OpenAPIV3_1.SchemaObject): OpenAPIV3_1.SchemaObject => {
      if (!schema || typeof schema !== "object") {
        return emptySchema;
      }
      const { components, paths, webhooks } = doc;
      const reusable = { components, paths, webhooks };

      const rootKeys = new Set(Object.keys(reusable));
      const schemaKeys = new Set(Object.keys(schema));
      const commonKeys = rootKeys.intersection(schemaKeys);
      if (commonKeys.size) {
        // eslint-disable-next-line no-console
        console.error("Common keys: ", commonKeys);
      }

      return { ...reusable, ...schema };
    },
    [doc],
  );

  return { ...ctx, resolveRefObj, extractSchema };
}

export interface OperationContext {
  method: OpenAPIV3_1.HttpMethods;
  pathname: string;
}
export const OperationContext = createContext<OperationContext | null>(null);
OperationContext.displayName = "OperationContext";
export function useOperation() {
  const { doc, resolveRefObj } = useOpenAPI();
  const ctx = use(OperationContext);
  if (!ctx)
    throw new Error("useOperation must be used within OperationContext");

  const pathItem = doc.paths?.[ctx.pathname];
  const op: OpenAPIV3_1.OperationObject | undefined = pathItem?.[ctx.method];

  function makeId(path: string[]) {
    return path.join("-");
  }

  const path = [K.paths, ctx.pathname, ctx.method];

  const servers = doc.servers || pathItem?.servers || op?.servers || [];

  type Params = (OpenAPIV3_1.ParameterObject & {
    $ref?: string;
    path: string[];
  })[];
  const pathItemParameters: Params = (pathItem?.parameters || [])
    .map(resolveRefObj)
    .map((p, idx) => ({
      ...p,
      path: [K.paths, ctx.pathname, K.parameters, idx.toString()],
    }));
  const operationParameters: Params = (op?.parameters || [])
    .map(resolveRefObj)
    .map((p, idx) => ({
      ...p,
      path: [K.paths, ctx.pathname, ctx.method, K.parameters, idx.toString()],
    }));
  const parameters = [...pathItemParameters, ...operationParameters].filter(
    (p, idx, arr) =>
      !arr.slice(idx + 1).some((pp) => pp.name === p.name && pp.in === p.in),
  );

  const requestBody = resolveRefObj(op?.requestBody);

  const responses = Object.fromEntries(
    Object.entries(op?.responses ?? {}).map(
      ([status, resp]) => [status, resolveRefObj(resp)] as const,
    ),
  );

  const resolved = { servers, parameters, requestBody, responses };
  return { ...op, ...ctx, makeId, path, ...resolved };
}

export function useRequest() {
  const o = useOperation();
  const { resolveRefObj } = useOpenAPI();
  const mediaRangePath = [...o.path, K.requestBody, K.content];
  const [_mediaRange = ""] = Object.keys(o.requestBody?.content ?? {});
  const [mediaRange, setMediaRange] = useStorage(mediaRangePath, _mediaRange);
  const media = resolveRefObj(o.requestBody?.content?.[mediaRange]);
  const mediaPath = [...mediaRangePath, mediaRange];
  return { media, mediaRange, setMediaRange, mediaRangePath, mediaPath };
}

export function useResponses() {
  const o = useOperation();
  const { resolveRefObj } = useOpenAPI();
  const storage = use(StorageContext);
  if (!storage) {
    throw new Error("Storage not found");
  }

  const [_statusRange = ""] = Object.keys(o.responses);
  const statusRangePath = [...o.path, K.responses];
  const [statusRange, setStatusRange] = useStorage(
    statusRangePath,
    _statusRange,
  );
  const response = o.responses[statusRange];

  const [_mediaRange = ""] = Object.keys(response?.content ?? {});
  const mediaRangePath = [...statusRangePath, statusRange, K.content];
  const [mediaRange, setMediaRange] = useStorage(mediaRangePath, _mediaRange);
  const media = resolveRefObj(response?.content?.[mediaRange]);
  const mediaPath = [...mediaRangePath, mediaRange];

  function setStatusMediaResponse(
    statusRange: string,
    mediaRange: string,
    resp: ResponseResult,
  ) {
    setStatusRange(statusRange);
    const mediaRangePath = [...statusRangePath, statusRange, K.content];
    storage?.setValue(o.makeId(mediaRangePath), mediaRange);
    const mediaPath = [...mediaRangePath, mediaRange];
    storage?.setValue(o.makeId(mediaPath), resp);
  }

  return {
    response,
    statusRange,
    setStatusRange,

    media,
    mediaRange,
    setMediaRange,
    mediaPath,

    setStatusMediaResponse,
  };
}

export interface HttpProxyContext {
  url: string;
  urlHeader: string;
}
export const HttpProxyContext = createContext<HttpProxyContext | null>(null);
HttpProxyContext.displayName = "HttpProxyContext";
export function useHttpProxy() {
  return use(HttpProxyContext);
}
