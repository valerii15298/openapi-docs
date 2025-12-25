export function Enum<Key extends string>(...keys: Key[]) {
  return Object.fromEntries(keys.map((key) => [key, key])) as { [K in Key]: K };
}

export const Format = Enum(
  "date-time",
  "date",
  "time",
  "duration",
  "email",
  "idn-email",
  "hostname",
  "idn-hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "iri",
  "iri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex",
);

export type Format = keyof typeof Format;

export const XMLNodeType = Enum(
  "element",
  "attribute",
  "text",
  "cdata",
  "none",
);
export type XMLNodeType = keyof typeof XMLNodeType;

export const ParameterIn = Enum(
  "query",
  "header",
  "path",
  "cookie",
  "querystring",
);
export type ParameterIn = keyof typeof ParameterIn;

export const ParameterStyle = Enum(
  "matrix",
  "label",
  "simple",
  "form",
  "spaceDelimited",
  "pipeDelimited",
  "deepObject",
  "cookie",
);
export type ParameterStyle = keyof typeof ParameterStyle;

export const SecuritySchemeType = Enum(
  "apiKey",
  "http",
  "mutualTLS",
  "oauth2",
  "openIdConnect",
);
export type SecuritySchemeType = keyof typeof SecuritySchemeType;

export const JsonSchemaType = Enum(
  "null",
  "boolean",
  "object",
  "array",
  "number",
  "string",
  "integer",
);

export type JsonSchemaType = keyof typeof JsonSchemaType;

const HttpMethod = Enum(
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
  "query",
);
export type HttpMethod = keyof typeof HttpMethod;
