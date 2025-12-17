import { Tabs, TabsList, TabsTrigger } from "@sane-ts/shadcn-ui";
import { SquarePen } from "@sane-ts/shadcn-ui/lucide";

import { MonacoEditor } from "#json-editor/monaco-editor";
import { Example } from "#openapi/operation-docs/example";
import {
  RequestBodyTab,
  useRequestBody,
} from "#openapi/operation-playground/use-request-body";

/**
 * Renders a tabbed "Body" input that switches between an inline editor and examples for the selected media type.
 *
 * The Edit tab shows a Monaco editor initialized with the current request body value and updates the body as the user types. The Examples tab displays example content derived from the media schema and shows any example tabs when present.
 *
 * @returns The RequestBody input UI as a JSX element containing the tabbed editor and examples view.
 */
export function RequestBodyInput() {
  const { media, setTab, tab, body, setBody, example } = useRequestBody();

  const editElement = (
    <MonacoEditor
      defaultValue={body}
      onValueChange={setBody}
      schema={media?.schema}
      resizable
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
      {tab === RequestBodyTab.edit ? editElement : exampleElement}
    </Tabs>
  );
}