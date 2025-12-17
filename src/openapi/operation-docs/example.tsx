import { Button } from "@sane-ts/shadcn-ui";
import { ExternalLink } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useMemo } from "react";

import { Description } from "#description";
import { MonacoEditor } from "#json-editor/monaco-editor";
import { useOperation } from "#openapi/context";

export function Example(
  e: OpenAPIV3_1.ExampleObject & {
    path: string[];
    schema?: OpenAPIV3_1.SchemaObject;
  },
) {
  const op = useOperation();
  const id = op.makeId(e.path);

  const summary = (
    <h4
      hidden={!e.externalValue && !e.summary}
      className="flex items-center text-xl font-semibold"
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

  const initialHeight = useMemo(() => {
    const stringified = JSON.stringify(e.value ?? {}, null, 2);
    const linesLength = stringified.split("\n").length;
    const linesHeight = linesLength * 23;
    const minHeight = 100;
    const maxHeight = 600;
    return Math.min(Math.max(linesHeight, minHeight), maxHeight);
  }, [e.value]);

  const value = useMemo(() => JSON.stringify(e.value, null, 2), [e.value]);

  return (
    <section id={id}>
      <MonacoEditor
        hidden={!("value" in e)}
        style={{ height: `${initialHeight}px` }}
        schema={e.schema}
        value={value}
        readOnly
        resizable="label"
      />
      {summary}
      <Description {...e} />
    </section>
  );
}
