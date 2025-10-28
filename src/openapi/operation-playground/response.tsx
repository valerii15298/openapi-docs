import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@sane-ts/shadcn-ui";
import { getExampleFromSchema } from "@scalar/oas-utils/spec-getters";
import { useEffect, useState } from "react";

import { RenderError } from "#json-editor/render-error";
import { Enum } from "#json-editor/utils";
import { KEY } from "#openapi/const";
import { useOperation, useOperationState } from "#openapi/context";
import { Example } from "#openapi/operation-docs/example";
import { Examples } from "#openapi/operation-docs/examples";

export type PlaygroundResponse =
  | {
      status: number;
      headers: Record<string, string>;
      body?: string;
    }
  | { error: unknown };

const ResponseTab = Enum("preview", "examples");
type ResponseTab = keyof typeof ResponseTab;

const emptyString = "string";

function jsonParse(str: string) {
  try {
    return JSON.parse(str) as unknown;
  } catch {
    return str;
  }
}

function OperationPlaygroundResponse(
  resp: PlaygroundResponse & { example?: unknown },
) {
  type Option = "body" | "headers" | "example";
  const [tab, setTab] = useState<Option>("body");
  if ("error" in resp) {
    return <RenderError error={resp.error} />;
  }
  const response = {
    ...resp,
    body: resp.body ? jsonParse(resp.body) : undefined,
  };

  const mode = (
    <ToggleGroup
      type="single"
      value={tab}
      onValueChange={(v) => {
        v && setTab(v as Option);
      }}
      size={"sm"}
      className="flex-1"
      variant={"outline"}
    >
      <ToggleGroupItem value="body">Body</ToggleGroupItem>
      <ToggleGroupItem value="headers">Headers</ToggleGroupItem>
      <ToggleGroupItem value="example">Example</ToggleGroupItem>
    </ToggleGroup>
  );

  return (
    <Example key={tab} summaryElement={mode} value={response[tab]} path={[]} />
  );
}

export function ResponseSample({ resp }: { resp?: PlaygroundResponse }) {
  const op = useOperation();
  const { responseStatus, responseContent } = useOperationState();
  const media = op.responses?.[responseStatus]?.content?.[responseContent];
  const path = [...op.path, KEY.RESPONSES, responseStatus, KEY.CONTENT];

  const defaultTab = media?.examples ? "examples" : "preview";
  const [tab, setTab] = useState<ResponseTab>(defaultTab);
  useEffect(() => {
    if (resp) setTab(ResponseTab.preview);
  }, [resp]);

  const example: unknown =
    media?.example ??
    (media?.schema && getExampleFromSchema(media.schema, { emptyString }));

  return (
    <Tabs
      asChild
      value={tab}
      onValueChange={(v) => {
        setTab(v as ResponseTab);
      }}
    >
      <section>
        <h3 className="flex flex-wrap items-start justify-between gap-2 text-2xl">
          Response
          <TabsList>
            <TabsTrigger value={ResponseTab.preview}>Preview</TabsTrigger>
            <TabsTrigger hidden={!media?.examples} value={ResponseTab.examples}>
              Examples
            </TabsTrigger>
          </TabsList>
        </h3>
        <TabsContent value={ResponseTab.examples}>
          <Examples {...media} path={[...path, responseContent]} />
        </TabsContent>
        <TabsContent value={ResponseTab.preview}>
          {
            // Make separate function which accepts media and returns example value and its path
            // make whole response tabs hidden when there is no examples
            // for Example component make summary a jsx element and pass to it tabs(toggle group) of example|body|headers
          }
          {resp ? (
            <OperationPlaygroundResponse {...resp} example={example} />
          ) : (
            <Example summary="Example" value={example} path={[]} />
          )}
        </TabsContent>
      </section>
    </Tabs>
  );
}
