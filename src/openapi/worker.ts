import {
  compileErrors,
  validate,
  type ValidationResult,
} from "@readme/openapi-parser";
import { bundle } from "@scalar/json-magic/bundle";
import { fetchUrls } from "@scalar/json-magic/bundle/plugins/browser";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { openapiSchemaUrl, openapiVersion } from "#const";
import { formatParse } from "#json-editor/enums";
import { ajv } from "#json-editor/json-validator";
import { deepSet, tryCatch } from "#json-editor/utils";
import { methods } from "#openapi/methods";
import type {
  BundleInputPayload,
  OutputPayload,
  ValidateInputPayload,
} from "#openapi/worker-types";
import { openapiSchema } from "#openapi-schema";

const Buffer = { isBuffer: () => false, from: (input: unknown) => input };
Object.assign(globalThis, { Buffer });

const getAjvValidate = ajv.compileAsync(openapiSchema);

const defaultErrorTitle = "OpenAPI schema validation failed.";

function respond(output: OutputPayload) {
  postMessage(output);
}

function processValidationResult(
  result: ValidationResult,
  id: number,
): OutputPayload | undefined {
  if (result.valid) return;
  const message = compileErrors(result);
  const [title = defaultErrorTitle, ...errors] = message.split("\n\n");
  const error = { title, body: errors.join("\n\n") };
  return { id, error };
}

async function validateOpenAPI(
  input: ValidateInputPayload,
): Promise<OutputPayload> {
  const { id, value, data, path, format } = input;
  const [parsed, parseError] = tryCatch<unknown, Error>(() =>
    formatParse[format](value),
  );

  if (parseError) {
    const error = { title: parseError.name, body: parseError.message };
    return { id, error };
  }
  const newData = deepSet(data, path, parsed);
  (newData as { openapi?: string }).openapi = openapiVersion;
  (newData as { $schema?: string }).$schema = openapiSchemaUrl;

  const cloned = structuredClone(newData) as OpenAPIV3_1.Document;
  if ("$schema" in cloned) delete cloned.$schema;
  // @ts-expect-error - it is okay to pass an invalid spec here
  const result = await validate(cloned);
  const readmeResult = processValidationResult(result, id);
  if (readmeResult) return readmeResult;

  const ajvValidate = await getAjvValidate;
  const valid = ajvValidate(newData);
  if (!valid && ajvValidate.errors?.length) {
    const title = ajvValidate.errors.map((e) => e.message).join("\n\n");
    const body = ajvValidate.errors
      .map((e) => JSON.stringify(e, null, 2))
      .join("\n\n");
    const error = { title, body };
    return { id, error };
  }

  return { id, data: newData as OpenAPIV3_1.Document };
}

function fixRequestBodySchemaRequired(data: unknown) {
  const spec = data as Partial<OpenAPIV3_1.Document> | undefined;
  Object.values(spec?.paths ?? {}).forEach((pathItem) => {
    methods.forEach((m) => {
      Object.values(pathItem?.[m]?.requestBody?.content ?? {}).forEach(
        (media: OpenAPIV3_1.MediaTypeObject | undefined) => {
          const schema = media?.schema;
          if (!schema || typeof schema !== "object") return;
          if (!Array.isArray(schema.required)) {
            delete schema.required;
          }
        },
      );
    });
  });
}

async function bundleOpenAPI(
  input: BundleInputPayload,
): Promise<OutputPayload> {
  const bundled = await bundle(input.url, {
    treeShake: false,
    plugins: [
      fetchUrls({
        fetch(url, init) {
          if (!input.proxy) return fetch(url, init);
          if (url instanceof Request) {
            throw new Error("Request instances are not supported.");
          }
          const headers = new Headers(init?.headers);
          headers.set(input.proxy.urlHeader, String(url));
          return fetch(input.proxy.url, { ...init, headers });
        },
      }),
    ],
  });
  fixRequestBodySchemaRequired(bundled);
  return validateOpenAPI({
    value: JSON.stringify(bundled, null, 2),
    path: [],
    data: {} as OpenAPIV3_1.Document,
    format: "json",
    id: input.id,
    type: "validate",
  });
}

function onErr(err: unknown, id: number) {
  const error =
    err instanceof Error
      ? { title: err.name, body: err.message }
      : {
          title: "Unknown error",
          body: JSON.stringify(err, null, 2),
        };
  respond({ id, error });
}

onmessage = async ({
  data,
}: {
  data: ValidateInputPayload | BundleInputPayload;
}) => {
  if (data.type === "bundle")
    await bundleOpenAPI(data)
      .then(respond)
      .catch((err: unknown) => {
        onErr(err, data.id);
      });

  if (data.type === "validate")
    await validateOpenAPI(data)
      .then(respond)
      .catch((err: unknown) => {
        onErr(err, data.id);
      });
};
