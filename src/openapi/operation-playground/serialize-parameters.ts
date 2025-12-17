import type { OpenAPIV3_1 } from "@scalar/openapi-types";

/**
 * Convert a value to its string representation.
 *
 * @param value - The value to convert
 * @returns The string representation of `value`; if `value` is an object, its JSON serialization, otherwise `String(value)`
 */
function toString(value: unknown) {
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}
const encode = encodeURIComponent;

/**
 * Produce key/value pairs representing a nested object's properties using bracket notation.
 *
 * Flattens `obj` into an array of `[key, value]` tuples where each `key` is a path formed by the root `name` and bracketed property names (e.g., "root[a][b]"). If `obj` is not an object or is `null`, returns a single tuple with `name` and the original value.
 *
 * @param name - Root key name to use as the base for bracketed paths
 * @param obj - Value to flatten; when not an object or when `null`, it is treated as a leaf value
 * @returns An array of `[key, value]` pairs where keys use bracket notation for nested properties and values are the corresponding leaf values
 */
function flattenWithBrackets(name: string, obj: unknown): [string, unknown][] {
  if (typeof obj !== "object" || obj === null) {
    return [[name, obj]];
  }
  return Object.entries(obj).flatMap(([k, v]) =>
    flattenWithBrackets(`${name}[${k}]`, v),
  );
}

const queryStyles = ["spaceDelimited", "pipeDelimited", "deepObject"] as const;
const delimiterMap = { spaceDelimited: "20", pipeDelimited: "%7C", form: "," };
/**
 * Serialize an OpenAPI parameter value into a URL query string fragment.
 *
 * @param p - OpenAPI ParameterObject (must include `name`); its `style` and `explode` settings determine serialization format
 * @param value - JSON-parsed parameter value: may be a string, number, boolean, null, array, or object
 * @returns A URL-encoded query string fragment representing the parameter (e.g., `name=value`, multiple `name=value` pairs joined with `&`, or `name=joinedValues`)
 * @throws Error - If `value` has an unsupported type for serialization
 */
export function queryParam(
  p: OpenAPIV3_1.ParameterObject & { name: string },
  value: unknown, // value is json parsed json value
) {
  const style = queryStyles.find((s) => s === p.style) || "form";
  const explode = p.explode ?? style === "form";
  const name = encode(p.name);

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return `${name}=${encode(String(value))}`;
  }

  if (style === "deepObject") {
    return flattenWithBrackets(p.name, value)
      .map(([k, v]) => `${encode(k)}=${encode(toString(v))}`)
      .join("&");
  }

  const delimiter = delimiterMap[style];

  if (Array.isArray(value) && explode) {
    return value.map((v) => `${name}=${encode(toString(v))}`).join("&");
  }
  if (Array.isArray(value) && !explode) {
    const values = value.map((v) => encode(toString(v)));
    return `${name}=${values.join(delimiter)}`;
  }

  if (typeof value === "object" && explode) {
    return Object.entries(value)
      .map(([k, v]) => `${encode(k)}=${encode(toString(v))}`)
      .join("&");
  }
  if (typeof value === "object" && !explode) {
    const values = Object.entries(value)
      .flatMap(([k, v]) => [encode(k), encode(toString(v))])
      .join(delimiter);
    return `${name}=${values}`;
  }
  throw new Error("Unsupported parameter value type");
}