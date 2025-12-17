import type { IJsonSchema } from "@scalar/openapi-types";
import { merge } from "allof-merge";
import { sample } from "openapi-sampler";

/**
 * Generate a sample value that conforms to the given JSON Schema using the provided document as context.
 *
 * @param doc - The OpenAPI/OpenAPI-like document used as context for resolving references and examples
 * @param schema - The JSON Schema (object or boolean) to sample from; if omitted or not an object, an empty object is used
 * @returns A sample value matching `schema`, or `null` if no sample could be generated
 */
export function getSample(doc: object, schema?: object | boolean) {
  schema = typeof schema === "object" ? schema : {};
  return sample(schema, {}, doc) ?? null;
}

/**
 * Serialize a sample value for a JSON Schema to a pretty-printed JSON string.
 *
 * @param doc - OpenAPI document used as context when generating the sample
 * @param schema - JSON Schema (object or boolean) to sample from; when omitted an empty schema is used
 * @returns A pretty-printed (2-space) JSON string of the generated sample, or `"null"` if no sample could be produced
 */
export function getSampleJSON(doc: object, schema?: object | boolean) {
  return JSON.stringify(getSample(doc, schema), null, 2);
}

/**
 * Resolve and merge a JSON Schema's `allOf` entries and `$ref` into a single schema object.
 *
 * When `schema` is falsy or not an object, returns an empty object. If `schema` contains
 * no `allOf` entries and no string `$ref`, returns the original `schema`. Otherwise returns
 * the result of merging the schema (with any appended `{ $ref }`) using the provided `source`
 * for merge context; merge errors and reference resolution errors are logged to console.
 *
 * @param schema - The JSON Schema (or boolean) to resolve and merge.
 * @param source - Context object passed to the merge operation (used for error reporting/source).
 * @returns The resolved and merged schema object, the original `schema` when no merge was needed, or `{}` when `schema` is falsy or not an object.
 */
export function resolveSchema(schema: IJsonSchema | boolean, source: object) {
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