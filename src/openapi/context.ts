import type { OpenAPIV3, OpenAPIV3_1 } from "@scalar/openapi-types";
import { createContext, use, useEffect, useState } from "react";

import { resolveRef } from "#json-editor/utils";

export interface OpenAPIContext {
  doc: OpenAPIV3_1.Document;
  path: string[];
  setPath: (path: string[]) => void;
  setEditPath?: (path: string[]) => void;
}
export const OpenAPIContext = createContext<OpenAPIContext | null>(null);
OpenAPIContext.displayName = "OpenAPIContext";
export function useOpenAPI() {
  const ctx = use(OpenAPIContext);
  if (!ctx) throw new Error("useOpenAPI must be used within OpenAPIContext");
  const { doc } = ctx;
  function resolveRefObj<T extends object | undefined>(
    obj: T | OpenAPIV3_1.ReferenceObject | OpenAPIV3.ReferenceObject,
  ): undefined | (T & { $ref?: string }) {
    if (obj && "$ref" in obj && obj.$ref) {
      const resolved = resolveRef<T>(obj.$ref, doc);
      // TODO return partial original obj when ref cannot be resolved
      if (resolved === undefined) return undefined;
      return { ...resolved, ...obj };
    }
    return obj as T;
  }

  function extractSchema(
    schema: OpenAPIV3_1.SchemaObject,
  ): OpenAPIV3_1.SchemaObject {
    if (!schema || typeof schema !== "object") {
      return {};
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
  }

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

  const path = ["paths", ctx.pathname, ctx.method];

  const servers = doc.servers || pathItem?.servers || op?.servers || [];

  const parameters = [
    ...(pathItem?.parameters || []),
    ...(op?.parameters || []),
  ]
    .map(resolveRefObj)
    .filter((p) => !!p)
    .filter(
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

export function useProviderOperationState() {
  const { resolveRefObj } = useOpenAPI();
  const { requestBody, responses = {} } = useOperation();

  const request = resolveRefObj(requestBody);
  const [_requestType = ""] = Object.keys(request?.content ?? {});
  const [requestType, setRequestType] = useState(_requestType);
  const requestMedia = request?.content?.[requestType];

  const [_responseStatus = ""] = Object.keys(responses);
  const [responseStatus, setResponseStatus] = useState(_responseStatus);
  const response = resolveRefObj(responses[responseStatus]);

  const [_responseType = ""] = Object.keys(response?.content ?? {});
  const [responseType, setResponseType] = useState(_responseType);
  const responseMedia = response?.content?.[responseType];

  useEffect(() => {
    !requestMedia && setRequestType(_requestType);
    !response && setResponseStatus(_responseStatus);
  }, [requestMedia, _requestType, response, _responseStatus]);

  useEffect(() => {
    !responseMedia && setResponseType(_responseType);
  }, [_responseType, responseMedia, responseStatus]);

  return {
    request: {
      ...request,
      contentType: requestType,
      setContentType: setRequestType,
      media: requestMedia,
    },

    response: {
      ...response,
      status: responseStatus,
      setStatus: setResponseStatus,

      contentType: responseType,
      setContentType: setResponseType,
      media: responseMedia,
    },
  };
}

type OperationState = ReturnType<typeof useProviderOperationState>;

export const OperationStateContext = createContext<OperationState | null>(null);
OperationStateContext.displayName = "OperationState";

export function useOperationState() {
  const ctx = use(OperationStateContext);
  if (!ctx)
    throw new Error("useOperationState must be used within OperationState");
  return ctx;
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
