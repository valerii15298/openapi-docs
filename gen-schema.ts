import { writeFileSync } from "node:fs";
import { headersMap } from "./gen-headers-map.ts";
import {
  markdownKeyword,
  openapiSchemaPath,
  specSchemaUrl,
  dialectUrl,
  specHtmlUrl,
} from "./src/const.ts";

const schema = await fetch(specSchemaUrl).then((res) => res.json());

schema.properties.$schema = { type: "string", format: "uri-reference" };

function fixDefsRef(key: string) {
  const { $ref } = schema.$defs[key];
  schema.$defs[key].allOf = [{ $ref }];
  delete schema.$defs[key].$ref;
}
fixDefsRef("paths");
fixDefsRef("responses");

function traverse(obj: unknown, fn: (obj: unknown) => void) {
  const isObj = typeof obj === "object" && obj !== null;
  if (!isObj) return;
  fn(obj);

  for (const key in obj) {
    const value = obj[key as keyof typeof obj];
    traverse(value, fn);
  }
}

function replaceDynamicRef(data: unknown) {
  const isObj = typeof data === "object" && data !== null;
  if (!isObj) return;

  const obj = data as Record<string, unknown>;

  const key = "$dynamicRef";
  if (obj[key] === "#meta") {
    // obj["$ref"] = draft07;
    // obj["type"] = "object";
    obj["$ref"] = dialectUrl;

    delete obj[key];
  }
}

function fixRefs(data: unknown) {
  const isObj = typeof data === "object" && data !== null;
  if (!isObj) return;

  const obj = data as Record<string, unknown>;

  const key = "$ref";
  const targetKey = "patternProperties";
  const refUrl = "#/$defs/specification-extensions";

  if (obj[key] !== refUrl) return;
  delete obj[key];

  const patternProperties = {
    "^x-": true,
  };

  if (obj[targetKey]) {
    Object.assign(obj[targetKey], patternProperties);
  } else {
    Object.assign(obj, { [targetKey]: patternProperties });
  }
}

function addDescriptionFromComment(data: unknown) {
  const isObj = typeof data === "object" && data !== null;
  if (!isObj) return;

  const obj = data as Record<string, unknown>;

  const key = "$comment";
  const descKey = "description";
  const descMarkKey = markdownKeyword;
  if (!obj[key] || obj[descKey]) return;

  const comment = obj[key];
  if (typeof comment !== "string" || !comment.startsWith(specHtmlUrl)) {
    // console.error("Unsupported $comment", { comment });
    return;
  }

  const id = comment.split("#").pop();
  if (!id) return;

  if (!(id in headersMap)) {
    console.error({ id });
    return;
  }
  obj[descMarkKey] = headersMap[id];
}

traverse(schema, replaceDynamicRef);
traverse(schema, fixRefs);
traverse(schema, addDescriptionFromComment);

{
  const parameterDef = schema.$defs["parameter"];
  const { schema: props } = parameterDef.dependentSchemas;
  Object.assign(parameterDef.properties, props.properties);
  parameterDef.allOf = [
    { $ref: "#/$defs/examples" },
    { $ref: "#/$defs/styles-for-form" },
    ...Object.values(props.$defs),
  ];
  delete parameterDef.dependentSchemas;

  schema.$defs["example"].properties.value = {
    type: ["string", "object", "array", "number", "boolean", "null"],
  };
}
const content = JSON.stringify(schema, null, 2);

writeFileSync(`./public/${openapiSchemaPath}`, content);
writeFileSync(`./src/${openapiSchemaPath}`, content);

export {};
