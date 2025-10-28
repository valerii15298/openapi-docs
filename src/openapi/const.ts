export const defaultValueMap = {
  string: "",
  number: 0,
  integer: 0,
  boolean: "",
  object: {},
  array: [],
  null: null,
} as const;

export const KEY = {
  EXAMPLES: "examples",
  EXAMPLE: "example",
  RESPONSES: "responses",
  PARAMETERS: "parameters",
  REQUEST_BODY: "requestBody",
  CONTENT: "content",
  SCHEMA: "schema",
  PROPERTIES: "properties",
  ITEMS: "items",
} as const;
