import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { merge } from "allof-merge";

import { K } from "#openapi/const";

export function resolveSchema(
  schema: OpenAPIV3_1.SchemaObject,
  source: object,
): OpenAPIV3_1.SchemaObject {
  if (!schema || typeof schema !== "object") return schema;
  if (!(K.$ref in schema)) return schema;

  const { $ref, ...rest } = schema;
  if (typeof $ref !== "string") return schema;

  const allOf = schema.allOf ?? [];
  allOf.push({ $ref });

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
