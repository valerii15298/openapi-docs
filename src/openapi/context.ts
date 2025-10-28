import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { createContext, use, useState } from "react";

export interface OpenAPIContext {
  doc: OpenAPIV3_1.Document;
  setEditPath?: (path: string[]) => void;
}
export const OpenAPIContext = createContext<OpenAPIContext | null>(null);
OpenAPIContext.displayName = "OpenAPIContext";
export function useOpenAPI() {
  const ctx = use(OpenAPIContext);
  if (!ctx) throw new Error("useOpenAPI must be used within OpenAPIContext");
  return ctx;
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
  const { responses = {}, requestBody = {} } = useOperation();

  const _requestContent = Object.keys(requestBody.content ?? {}).at(0);
  const [requestContent, setRequestContent] = useState(_requestContent || "");

  const response = Object.entries(responses)[0] || ["", { content: {} }];
  const [responseStatus, setResponseStatus] = useState(response[0]);

  const _responseContent = Object.keys(response[1].content ?? {}).at(0) || "";
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
