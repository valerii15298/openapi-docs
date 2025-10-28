import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import type { EditorFormat } from "#json-editor/enums";
import type { HttpProxyContext } from "#openapi/context";

export interface ValidateInputPayload {
  id: number;
  value: string;
  path: string[];
  data: OpenAPIV3_1.Document;
  format: EditorFormat;
  type: "validate";
}
export interface BundleInputPayload {
  id: number;
  url: string;
  proxy?: HttpProxyContext | null;
  type: "bundle";
}

export interface OutputPayload {
  id: number;
  error?: { title: string; body: string };
  data?: OpenAPIV3_1.Document;
}
