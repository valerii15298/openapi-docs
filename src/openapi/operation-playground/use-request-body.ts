import { Enum } from "#json-editor/utils";
import { K } from "#openapi/const";
import { useOpenAPI, useOperation, useRequest } from "#openapi/context";
import { useExample } from "#openapi/operation-docs/examples";
import { getSampleJSON } from "#schema";
import { useStorage } from "#storage";

export const RequestBodyTab = Enum("edit", "examples");
export type RequestBodyTab = keyof typeof RequestBodyTab;

type RequestBody =
  | {
      body: string;
      tab: RequestBodyTab;
      include: boolean;
    }
  | undefined;

/**
 * Manage and persist the request body state for the current operation media type.
 *
 * Exposes the stored request body (initialised from a generated sample or prior storage), the active tab selection, and whether the request body is included, along with setters and contextual media/example data.
 *
 * @returns An object containing:
 * - `body` — the stored request body string (or `undefined` if not set),
 * - `tab` — the active `RequestBodyTab` ("edit" or "examples"),
 * - `include` — `true` if the operation defines a requestBody, `false` otherwise,
 * - `setTab(tab)` — function to set the active tab,
 * - `setBody(body)` — function to set the body string,
 * - `media` — the current request media information,
 * - `example` — the resolved example for the current media (if any)
 */
export function useRequestBody() {
  const o = useOperation();
  const { doc } = useOpenAPI();
  const { media, mediaPath } = useRequest();

  const body = getSampleJSON(doc, media?.schema);
  const defaultRequest: RequestBody = {
    body,
    tab: RequestBodyTab.edit,
    include: !!o.requestBody,
  };
  const [request, setRequest] = useStorage(mediaPath, defaultRequest);
  const setTab = (tab: RequestBodyTab) => setRequest((s) => ({ ...s, tab }));
  const setBody = (body: string) => setRequest((s) => ({ ...s, body }));

  const example = useExample({ ...media, path: [...mediaPath, K.examples] });

  return {
    ...request,
    setTab,
    setBody,

    media,
    example,
  };
}

/**
 * Determine the active request body content for the current operation based on the selected tab and available example.
 *
 * If the operation has no requestBody, or no example is available when the Examples tab is selected, no content is returned.
 *
 * @returns The request body as a JSON string when an example is selected or the raw editable body when the Edit tab is selected, or `undefined` if no content is available.
 */
export function useActiveRequestBody() {
  const o = useOperation();
  const { tab, body, example } = useRequestBody();

  if (!o.requestBody) return undefined;
  if (tab === RequestBodyTab.edit) return body;
  const exampleValue: unknown = example.example?.value;
  if (exampleValue === undefined) return undefined;
  return JSON.stringify(exampleValue);
}