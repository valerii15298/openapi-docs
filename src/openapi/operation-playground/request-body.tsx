import { Tabs, TabsList, TabsTrigger } from "@sane-ts/shadcn-ui";
import { SquarePen } from "@sane-ts/shadcn-ui/lucide";
import { Activity } from "react";

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
  const editElement = (
    <MonacoEditor
      value={body}
      onValueChange={setBody}
      schema={extractSchema(media?.schema)}
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
        <TabsList className="h-fit flex-wrap">
          <TabsTrigger className="py-0.5" value={RequestBodyTab.edit}>
            <SquarePen /> Edit
          </TabsTrigger>
          <TabsTrigger
            className="py-0.5"
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
