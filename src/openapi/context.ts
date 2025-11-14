import type { OpenAPIV3, OpenAPIV3_1 } from "@scalar/openapi-types";
import { createContext, use, useState } from "react";

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
  ) {
    if (obj && "$ref" in obj && obj.$ref) {
      return resolveRef<T>(obj.$ref, doc);
    }
    return obj as T;
  }

  function extractSchema(
    schema: OpenAPIV3_1.SchemaObject,
  ): OpenAPIV3_1.SchemaObject {
    if (!schema || typeof schema !== "object") {
      return {};
    }
    const docKeys = new Set(Object.keys(doc));
    const schemaKeys = new Set(Object.keys(schema));
    const commonKeys = docKeys.intersection(schemaKeys);
    if (commonKeys.size) {
      // eslint-disable-next-line no-console
      console.error("Common keys", commonKeys);
    }
    return { ...doc, ...schema };
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
  const { doc } = useOpenAPI();
  const ctx = use(OperationContext);
  if (!ctx)
    throw new Error("useOperation must be used within OperationContext");

  const op: OpenAPIV3_1.OperationObject | undefined =
    doc.paths?.[ctx.pathname]?.[ctx.method];
  if (!op) throw new Error("Operation not found in the OpenAPI document");

  function makeId(path: string[]) {
    return path.join("-");
  }

  const path = ["paths", ctx.pathname, ctx.method];
  const servers = [...(op.servers ?? []), ...(doc.servers ?? [])];
  return { ...op, ...ctx, makeId, path, servers };
}

export function useProviderOperationState() {
  const { resolveRefObj } = useOpenAPI();
  const op = useOperation();

  const requestBody = resolveRefObj(op.requestBody);
  const _requestContent = Object.keys(requestBody?.content ?? {}).at(0);
  const [requestContent, setRequestContent] = useState(_requestContent || "");

  const [response] = Object.entries(op.responses ?? {});
  const [responseStatus, setResponseStatus] = useState(response?.[0] ?? "");

  const _response = resolveRefObj(response?.[1]);
  const _responseContent = Object.keys(_response?.content ?? {}).at(0) || "";
  const [responseContent, setResponseContent] = useState(_responseContent);

  return {
    requestContent,
    setRequestContent,

    responseStatus,
    setResponseStatus,

    responseContent,
    setResponseContent,
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
