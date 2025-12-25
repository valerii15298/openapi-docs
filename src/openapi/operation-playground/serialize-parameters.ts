import type { OpenAPIV3_1 } from "#types/index";

function stringify(value: unknown) {
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}
const encode = encodeURIComponent;

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
export function queryParam(
  p: OpenAPIV3_1.Parameter & { name: string },
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
      .map(([k, v]) => `${encode(k)}=${encode(stringify(v))}`)
      .join("&");
  }

  const delimiter = delimiterMap[style];

  if (Array.isArray(value) && explode) {
    return value.map((v) => `${name}=${encode(stringify(v))}`).join("&");
  }
  if (Array.isArray(value) && !explode) {
    const values = value.map((v) => encode(stringify(v)));
    return `${name}=${values.join(delimiter)}`;
  }

  if (typeof value === "object" && explode) {
    return Object.entries(value)
      .map(([k, v]) => `${encode(k)}=${encode(stringify(v))}`)
      .join("&");
  }
  if (typeof value === "object" && !explode) {
    const values = Object.entries(value)
      .flatMap(([k, v]) => [encode(k), encode(stringify(v))])
      .join(delimiter);
    return `${name}=${values}`;
  }
  throw new Error("Unsupported parameter value type");
}
