import { merge } from "allof-merge";
import { sample } from "openapi-sampler";

import type { OpenAPIV3_1 } from "#types/index";

export function getSample(doc: object, schema?: object | boolean) {
  schema = typeof schema === "object" ? schema : {};
  return sample(schema, {}, doc) ?? null;
}

export function getSampleJSON(doc: object, schema?: object | boolean) {
  return JSON.stringify(getSample(doc, schema), null, 2);
}

export function resolveSchema(schema: OpenAPIV3_1.Schema, source: object) {
  if (!schema || typeof schema !== "object") return {};
  const allOf = [...(schema.allOf ?? [])];
  const { $ref, ...rest } = schema;
  if (typeof $ref === "string") {
    allOf.push({ $ref });
  }
  if (!allOf.length) return schema;

  return merge(
    { ...rest, allOf },
    {
      source,
      // TODO add callback onError function to propagate errors back
      // eslint-disable-next-line no-console
      onMergeError: (...args) => console.log(...args),
      // eslint-disable-next-line no-console
      onRefResolveError: (...args) => console.log(...args),
    },
  ) as typeof schema;
}
