import { Enum } from "#json-editor/utils";

export const defaultValueMap = {
  string: "",
  number: 0,
  integer: 0,
  boolean: "",
  object: {},
  array: [],
  null: null,
} as const;

export const K = Enum(
  "servers",
  "paths",
  "webhooks",
  "components",
  "security",
  "tags",
  "info",

  "securitySchemes",

  "required",
  "enum",
  "$ref",

  "examples",
  "example",
  "responses",
  "parameters",
  "requestBody",
  "content",
  "schema",
  "properties",
  "items",
);
