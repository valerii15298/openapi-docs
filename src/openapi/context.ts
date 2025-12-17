import type { OpenAPIV3, OpenAPIV3_1 } from "@scalar/openapi-types";
import { createContext, use } from "react";

import { resolveRef } from "#json-editor/utils";
import { K } from "#openapi/const";
import type { ResponseResult } from "#openapi/operation-playground/response";
import { StorageContext, useStorage } from "#storage";

export interface OpenAPIContext {
  doc: OpenAPIV3_1.Document;
  path: string[];
  setPath: (path: string[]) => void;
  setEditPath?: (path: string[]) => void;
}
export const OpenAPIContext = createContext<OpenAPIContext | null>(null);
OpenAPIContext.displayName = "OpenAPIContext";
/**
 * Provide access to the OpenAPI context along with helpers for resolving `$ref` references and merging schema objects.
 *
 * Throws an error if called outside the OpenAPIContext provider.
 *
 * @returns The OpenAPI context augmented with:
 * - `resolveRefObj`: resolves a referenced object against the document and returns the merged object (preserving `$ref`) or `undefined` when input is undefined.
 * - `extractSchema`: merges a schema object with the document's top-level `components`, `paths`, and `webhooks`, returning the combined schema object.
 */
export function useOpenAPI() {
  const ctx = use(OpenAPIContext);
  if (!ctx) throw new Error("useOpenAPI must be used within OpenAPIContext");
  const { doc } = ctx;
  type In = OpenAPIV3_1.ReferenceObject | OpenAPIV3.ReferenceObject | undefined;
  function resolveRefObj<T extends object>(
    obj: T | In,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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
/**
 * Access the current OpenAPI operation and compute derived values useful to UI and state management.
 *
 * The returned object merges the operation object with the operation context and includes:
 * - `makeId(path: string[])`: helper that creates an identifier by joining a path array with hyphens
 * - `path`: the document path array identifying this operation
 * - `servers`: resolved servers for the operation (operation → pathItem → document fallback)
 * - `parameters`: resolved and deduplicated parameter objects annotated with their document paths
 * - `requestBody`: resolved requestBody object for the operation, if any
 * - `responses`: map of response objects keyed by status with each response resolved
 *
 * @returns An object that combines the operation data, the operation context, `makeId`, `path`, and the resolved `servers`, `parameters`, `requestBody`, and `responses`.
 * @throws Error if called outside of an OperationContext provider
 */
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

/**
 * Provides the current request-body media selection and the resolved media object for the active operation.
 *
 * The selected media range is initialized from the first key in the operation's `requestBody.content`. The hook exposes the resolved media (with `$ref` resolved when present), the selected media-range value and its setter, and the document paths for the content collection and the selected media entry.
 *
 * @returns An object containing:
 * - `media`: The resolved media object for the currently selected media range, or `undefined` if not present.
 * - `mediaRange`: The currently selected media type string (e.g., "application/json").
 * - `setMediaRange`: Setter function to update the selected `mediaRange`.
 * - `mediaRangePath`: Path array pointing to the operation's `requestBody.content` in the OpenAPI document.
 * - `mediaPath`: Path array pointing to the currently selected media entry under `requestBody.content`.
 */
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

/**
 * Manage and persist the selected response status and media type for the current operation.
 *
 * @returns An object with:
 * - `response` — the resolved response object for the currently selected status range.
 * - `statusRange` — the currently selected response status range string.
 * - `setStatusRange` — setter for `statusRange`.
 * - `media` — the resolved media/content object for the currently selected media range.
 * - `mediaRange` — the currently selected media type key (e.g., "application/json").
 * - `setMediaRange` — setter for `mediaRange`.
 * - `mediaPath` — the document/storage path array pointing to the selected media entry.
 * - `setStatusMediaResponse` — function that persists a selected `statusRange` and `mediaRange` and stores associated response metadata; it accepts `(statusRange: string, mediaRange: string, resp: ResponseResult)`.
 */
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