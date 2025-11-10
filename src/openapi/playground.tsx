import {
  ModeToggle,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Toggle,
} from "@sane-ts/shadcn-ui";
import { MousePointerSquareDashed } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useState } from "react";

import { EditorBreadcrumbs } from "#json-editor/breadcrumbs";
import { useEditorState } from "#json-editor/context";
import { Editor } from "#json-editor/editor";
import { EditorTabs } from "#json-editor/tabs";
import { Docs } from "#openapi/docs";
import { ImportSpec } from "#openapi/import-spec";
import { openapiSchema } from "#openapi-schema";

export function Playground(p: { defaultSpec: OpenAPIV3_1.Document }) {
  const [selectingEditTarget, setSelectingEditTarget] = useState(false);
  const [uri, setUri] = useState("");

  const editorCtx = useEditorState<OpenAPIV3_1.Document>({
    data: p.defaultSpec,
  });

  const setEditPath = (path: string[]) => {
    editorCtx.setPath(path);
    setSelectingEditTarget(false);
  };

  const selectEditToggle = (
    <Toggle
      pressed={selectingEditTarget}
      onPressedChange={setSelectingEditTarget}
      size={"sm"}
      variant={"outline"}
      className="size-7 min-w-7"
    >
      <MousePointerSquareDashed />
    </Toggle>
  );

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25} className="flex flex-col">
        <Editor
          key={uri}
          ctx={editorCtx}
          schema={openapiSchema}
          onValueChange={(value) => {
            editorCtx.setData(value as OpenAPIV3_1.Document);
            // TODO validate in web worker
            editorCtx.setError(null);
          }}
        >
          <div className="flex items-center gap-2 overflow-auto p-1 pb-0 text-nowrap">
            <ModeToggle className="relative size-7" />
            {selectEditToggle}
            <ImportSpec
              defaultUri={uri}
              setUri={(uri, data) => {
                setUri(uri);
                editorCtx.setData(data);
                editorCtx.setPath([]);
                editorCtx.setError(null);
              }}
            />
            <EditorTabs />
            <span title={uri} className="text-muted-foreground truncate">
              {uri}
            </span>
          </div>
          <EditorBreadcrumbs />
        </Editor>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel style={{ transform: "translateZ(0)" }}>
        <Docs
          setEditPath={selectingEditTarget ? setEditPath : undefined}
          doc={editorCtx.data}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
