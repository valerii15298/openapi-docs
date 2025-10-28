export const openapiSchemaPath = "openapi-schema.json";

export const openapiSchemaUrl = `${globalThis.origin}/${openapiSchemaPath}`;

export const markdownKeyword = "markdownDescription";

export const openapiVersion = "3.1.2";
const shortVersion = "3.1";
const dateVersion = "2025-09-15";
const dialectDateVersion = "2024-11-10";

// export const openapiVersion = "3.2.0";
// const shortVersion = "3.2";
// const dateVersion = "2025-09-17";
// const dialectDateVersion = "2025-09-17";

// const shortVersion = openapiVersion.slice(0, 3);
const urlPrefix = `https://spec.openapis.org/oas/${shortVersion}`;

export const specHtmlUrl = `https://spec.openapis.org/oas/v${shortVersion}#`;
export const specSchemaUrl = `${urlPrefix}/schema/${dateVersion}`;
export const specSchemaBaseUrl = `${urlPrefix}/schema-base/${dateVersion}`;
export const dialectUrl = `${urlPrefix}/dialect/${dialectDateVersion}`;

export const markdownSpecUrl = `https://raw.githubusercontent.com/OAI/OpenAPI-Specification/refs/heads/main/versions/${openapiVersion}.md`;
