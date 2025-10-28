import { Button } from "@sane-ts/shadcn-ui";
import { ExternalLink } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import type { ReactNode } from "react";

import { Description } from "#description";
import { Editor } from "#json-editor/editor";
import { EditorTabs } from "#json-editor/tabs";
import { CodeSample } from "#openapi/operation-docs/code-sample";

export function Example(
  e: OpenAPIV3_1.ExampleObject & {
    path: string[];
    schema?: OpenAPIV3_1.SchemaObject;
    summaryElement?: ReactNode;
  },
) {
  const summary = e.summaryElement || (
    <h4
      hidden={!e.externalValue && !e.summary}
      className="flex max-w-full min-w-20 flex-1 items-center justify-center overflow-hidden text-xl font-semibold"
    >
      <Button
        asChild
        hidden={!e.externalValue}
        variant={"link"}
        size={"icon"}
        className="hover:bg-accent mr-2 size-6"
      >
        <a href={e.externalValue} target="_blank" rel="noopener noreferrer">
          <ExternalLink />
        </a>
      </Button>
      <span title={e.summary || e.externalValue} className="truncate">
        {e.summary || e.externalValue}
      </span>
    </h4>
  );

  const linesLength = JSON.stringify(e.value ?? {}, null, 2).split("\n").length;
  const linesHeight = linesLength * 23;
  const minHeight = 200;
  const maxHeight = 600;
  const initialHeight = Math.min(Math.max(linesHeight, minHeight), maxHeight);

  const value = e.value as unknown;
  if (typeof value !== "object" || value === null) {
    return (
      <section className="example">
        {summary}
        <CodeSample className="my-1" code={value} />
        <Description {...e} />
      </section>
    );
  }

  return (
    <section className="example">
      <div
        style={{ height: `${initialHeight}px` }}
        className="-ml-5 resize-y overflow-hidden pb-4"
      >
        <Editor schema={e.schema} default={{ data: value, readOnly: true }}>
          <div className="mb-1 ml-5 flex items-center gap-2 overflow-auto">
            {summary}
            <EditorTabs className="ml-auto" />
          </div>
        </Editor>
        <div className="text-muted-foreground mr-4 h-4 text-end text-xs/4">
          click to resize {"->"}
        </div>
      </div>
      <Description {...e} />
    </section>
  );
}
