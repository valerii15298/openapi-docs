import { Enum } from "#json-editor/utils";
import { K } from "#openapi/const";
import { useOpenAPI, useOperation, useRequest } from "#openapi/context";
import { useExample } from "#openapi/operation-docs/examples";
import { getSampleJSON } from "#schema";
import { useStorage } from "#storage";

export const RequestBodyTab = Enum("edit", "examples");
export type RequestBodyTab = keyof typeof RequestBodyTab;

type RequestBody = {
  body: string;
  tab: RequestBodyTab;
  include: boolean;
};

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

export function useActiveRequestBody() {
  const o = useOperation();
  const { tab, body, example } = useRequestBody();

  if (!o.requestBody) return undefined;
  if (tab === RequestBodyTab.edit) return body;
  const exampleValue: unknown = example.example?.value;
  if (exampleValue === undefined) return undefined;
  return JSON.stringify(exampleValue);
}
