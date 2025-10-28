/* eslint-disable no-plusplus */
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import type { EditorFormat } from "#json-editor/enums";
import type { HttpProxyContext } from "#openapi/context";
import type {
  BundleInputPayload,
  OutputPayload,
  ValidateInputPayload,
} from "#openapi/worker-types";

const worker = new Worker(new URL("./worker", import.meta.url), {
  type: "module",
});

const pendingCalls: Record<number, (v: OutputPayload) => void> = {};
let callId = 0;

// eslint-disable-next-line @typescript-eslint/max-params
export function validateOpenAPI(
  value: string,
  format: EditorFormat,
  data: OpenAPIV3_1.Document,
  path: string[],
) {
  const id = callId++;
  return new Promise<OutputPayload>((resolve) => {
    worker.postMessage({
      id,
      value,
      format,
      type: "validate",
      data,
      path,
    } satisfies ValidateInputPayload);
    pendingCalls[id] = resolve;
  });
}
export function bundleOpenAPI(url: string, proxy?: HttpProxyContext | null) {
  const id = callId++;
  return new Promise<OutputPayload>((resolve) => {
    worker.postMessage({
      id,
      url,
      proxy,
      type: "bundle",
    } satisfies BundleInputPayload);
    pendingCalls[id] = resolve;
  });
}

worker.onmessage = (e: { data: OutputPayload }) => {
  const resolve = pendingCalls[e.data.id];
  resolve?.(e.data);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete pendingCalls[e.data.id];
};
