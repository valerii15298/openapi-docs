import { Tabs, TabsList, TabsTrigger } from "@sane-ts/base-shadcn";
import { Activity, useMemo } from "react";

import { MonacoEditor } from "#json-editor/monaco-editor";
import { useOpenAPI } from "#openapi/context";
import { Example } from "#openapi/operation-docs/example";
import {
  RequestBodyTab,
  useRequestBody,
} from "#openapi/operation-playground/use-request-body";

export function RequestBodyInput() {
  const { media, setTab, tab, body, setBody, example } = useRequestBody();
  const { extractSchema } = useOpenAPI();
  const schema = useMemo(
    () => extractSchema(media?.schema),
    [media?.schema, extractSchema],
  );
  const editElement = (
    <MonacoEditor
      value={body}
      onValueChange={setBody}
      schema={schema}
      resizable="label"
      className={"mb-2 h-32"}
    />
  );

  const exampleElement = (
    <Example schema={media?.schema} {...example.example} path={example.path} />
  );

  return (
    <Tabs
      value={tab}
      onValueChange={(t) => t in RequestBodyTab && setTab(t as RequestBodyTab)}
    >
      <h4 className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xl font-semibold">
        Body
        <TabsList variant={"line"} className="h-fit! flex-wrap *:pb-0">
          <TabsTrigger value={RequestBodyTab.edit}>Edit</TabsTrigger>
          <TabsTrigger
            hidden={!example.tabs}
            value={RequestBodyTab.examples}
            children={`Examples`}
          />
        </TabsList>
        {tab === RequestBodyTab.examples && example.tabs}
      </h4>
      <Activity mode={tab === RequestBodyTab.edit ? "visible" : "hidden"}>
        {editElement}
      </Activity>
      <Activity mode={tab === RequestBodyTab.examples ? "visible" : "hidden"}>
        {exampleElement}
      </Activity>
    </Tabs>
  );
}
