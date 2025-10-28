import {
  dialectUrl,
  openapiSchemaUrl,
  openapiVersion,
} from "openapi-docs/const";
import type { OpenAPIV3_1 } from "openapi-docs/types";

export const spec: OpenAPIV3_1.Document & { $schema?: string } = {
  $schema: openapiSchemaUrl,
  openapi: openapiVersion,
  info: {
    title: "Example API",
    version: "0.0.1",
    summary: "Sane OpenAPI",
    description: "This is an example OpenAPI specification.",
  },
  servers: [],
  paths: { "/example": { get: { tags: ["tag1"] } } },
};
