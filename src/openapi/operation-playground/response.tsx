import { Tabs, TabsList, TabsTrigger } from "@sane-ts/shadcn-ui";

import { Enum } from "#json-editor/utils";
import { K } from "#openapi/const";
import { useOpenAPI, useResponses } from "#openapi/context";
import { statusColor } from "#openapi/methods";
import { Example } from "#openapi/operation-docs/example";
import { useExample } from "#openapi/operation-docs/examples";
import type { Result } from "#result";
import { Ok } from "#result";
import { getSampleJSON } from "#schema";
import { useStorage } from "#storage";

export const ResponseTab = Enum("body", "headers", "examples");
type ResponseTab = keyof typeof ResponseTab;

export type ResponseResult = {
  status: number;

  headers: Record<string, string>;
  body: Result<string, Error>;

  tab: ResponseTab;
};

function parseJSON(input: string) {
  try {
    return JSON.parse(input) as unknown;
  } catch {
    return input;
  }
}

function useResponse() {
  const { doc } = useOpenAPI();
  const { media, mediaPath } = useResponses();

  const body = Ok(getSampleJSON(doc, media?.schema));
  const headers = {}; // TODO generate default headers
  const defaultResponse: ResponseResult = {
    body,
    headers,
    status: 0,
    tab: ResponseTab.body,
  };
  const [response, setResponse] = useStorage(mediaPath, defaultResponse);
  const setTab = (tab: ResponseTab) => setResponse((s) => ({ ...s, tab }));

  const example = useExample({ ...media, path: [...mediaPath, K.examples] });

  return {
    ...response,
    setTab,

    media,
    example,
  };
}

export function Response() {
  const { tab, setTab, status, media, body, headers, example } = useResponse();

  const propsMap = {
    [ResponseTab.body]: {
      value: body.isOk ? parseJSON(body.ok) : body.err, // TODO add serializedValue as body raw string and use parse json error here
      schema: media?.schema,
    },
    [ResponseTab.headers]: { value: headers },
    [ResponseTab.examples]: {
      ...example.example,
      schema: media?.schema,
    },
  };

  return (
    <Tabs
      value={tab}
      onValueChange={(t) => t in ResponseTab && setTab(t as ResponseTab)}
    >
      <h3 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-2xl font-semibold">
        Response
        <span
          hidden={!status}
          className={`pt-1 text-xl font-semibold ${statusColor[`${status.toString()[0]}xx` as const] || ""}`}
        >
          {status}
        </span>
        <TabsList className="h-fit flex-wrap">
          <TabsTrigger value={ResponseTab.headers} children="Headers" />
          <TabsTrigger value={ResponseTab.body} children="Body" />
          <TabsTrigger
            hidden={!example.tabs}
            value={ResponseTab.examples}
            children={`Examples`}
          />
        </TabsList>
        {tab === ResponseTab.examples && example.tabs}
      </h3>
      <Example {...propsMap[tab]} path={example.path} />
    </Tabs>
  );
}
