import { Button } from "@sane-ts/base-shadcn";
import { ExternalLink } from "@sane-ts/base-shadcn/lucide";
import { useMemo } from "react";

import { Description } from "#description";
import { MonacoEditor } from "#json-editor/monaco-editor";
import { useOpenAPI, useOperation } from "#openapi/context";
import type { OpenAPIV3_1 } from "#types/index";

export function Example(
  e: OpenAPIV3_1.Example & {
    path: string[];
    schema?: OpenAPIV3_1.Schema;
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
        hidden={!e.externalValue}
        variant={"link"}
        size={"icon"}
        className="hover:bg-accent mr-2 size-6"
        nativeButton={false}
        render={
          <a href={e.externalValue} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
          </a>
        }
      />
      <span title={e.summary || e.externalValue} className="truncate">
        {e.summary || e.externalValue}
      </span>
    </h4>
  );

  const initialHeight = useMemo(() => {
    const stringified = JSON.stringify(e.value ?? {}, null, 2);
    const linesLength = stringified.split("\n").length;
    const linesHeight = linesLength * 23;
    const minHeight = 30;
    const maxHeight = 600;
    return Math.min(Math.max(linesHeight, minHeight), maxHeight);
  }, [e.value]);

  const value = useMemo(() => JSON.stringify(e.value, null, 2), [e.value]);

  const { extractSchema } = useOpenAPI();
  const schema = useMemo(
    () => extractSchema(e.schema),
    [e.schema, extractSchema],
  );
  return (
    <section id={id}>
      <MonacoEditor
        hidden={!("value" in e)}
        style={{ height: `${initialHeight}px` }}
        schema={schema}
        value={value}
        readOnly
        resizable="label"
        className="mb-1"
      />
      {summary}
      <Description {...e} />
    </section>
  );
}
