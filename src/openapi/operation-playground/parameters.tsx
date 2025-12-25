import {
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sane-ts/shadcn-ui";
import { HelpCircle, Triangle } from "@sane-ts/shadcn-ui/lucide";
import { useEffect, useEffectEvent, useMemo } from "react";

import { MonacoEditor } from "#json-editor/monaco-editor";
import { useOpenAPI, useOperation } from "#openapi/context";
import { Example } from "#openapi/operation-docs/example";
import { useExample } from "#openapi/operation-docs/examples";
import { useParam } from "#openapi/operation-playground/create-request";
import { primitiveInput } from "#openapi/operation-playground/schema-field";
import { queryParam } from "#openapi/operation-playground/serialize-parameters";
import { Result } from "#result";
import { getSample, resolveSchema } from "#schema";
import type { OpenAPIV3_1 } from "#types/index";

export function ParameterInput(
  p: OpenAPIV3_1.Parameter & { path: string[]; name: string; in: string },
) {
  const { doc, extractSchema } = useOpenAPI();
  const [param, setParam] = useParam(p);
  const examples = useExample(p);

  const primitive = primitiveInput({
    field: param ?? { value: "", setValue: () => void 0 },
    name: p.name,
    schema: resolveSchema(p.schema ?? {}, doc),
  });

  const setDefault = useEffectEvent(() => {
    const sample: unknown = p.example || getSample(doc, p.schema);
    const value = primitive
      ? String(sample)
      : JSON.stringify(sample, null, 2).replace(/\s+/gu, " ");
    const serialized = p.in === "query" ? queryParam(p, value) : undefined;

    setParam({ value, include: !!p.required, serialized });
  });
  const exists = !!param;
  useEffect(() => {
    if (!exists) setDefault();
  }, [exists]);

  const schema = useMemo(
    () => extractSchema(p.schema),
    [p.schema, extractSchema],
  );

  if (!param) return null;

  const element = primitive || (
    <MonacoEditor
      value={param.value}
      onValueChange={(value) => {
        param.setValue(value);
        const result = Result.catchError(() => JSON.parse(value) as unknown);
        if (!result.isOk || p.in !== "query") return;
        param.setSerialized(queryParam(p, result.ok));
      }}
      schema={schema}
      resizable
    />
  );

  const spanFull = primitive ? "" : "col-span-full";
  return (
    <div className={`group/form-item h-fit min-w-0 ${spanFull}`}>
      <Label className="mb-0.5 text-wrap break-all">
        <Checkbox
          disabled={p.required}
          checked={param.include}
          onCheckedChange={(include) => param.setInclude(!!include)}
        />
        {p.name}
        <Popover>
          <PopoverTrigger
            hidden={!examples.tabs}
            className="data-[state=open]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer rounded opacity-0 group-hover/form-item:opacity-100 data-[state=open]:opacity-100"
          >
            <HelpCircle size={16} />
          </PopoverTrigger>
          <PopoverContent className="resize overflow-auto">
            {examples.tabs}
            <div className="my-2" />
            <Example
              {...examples.example}
              schema={p.schema}
              path={examples.path}
            />
          </PopoverContent>
        </Popover>
      </Label>
      {element}
    </div>
  );
}

export function ParametersInput() {
  const o = useOperation();

  return (
    <details
      hidden={!o.parameters.length}
      className="open:mb-2 open:[&>summary>svg]:rotate-180"
      onInvalid={(e) => (e.currentTarget.open = true)}
    >
      <summary
        className="flex w-full cursor-pointer items-center gap-1"
        onMouseDown={(e) => e.detail > 1 && e.preventDefault()}
      >
        <Triangle className="fill-foreground w-3 rotate-90 transition-transform" />
        <h4 className="text-xl font-semibold">Parameters</h4>
      </summary>
      <ol className="mt-2 grid gap-4 @sm:grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 @7xl:grid-cols-7">
        {o.parameters.map(
          (p) =>
            p.schema &&
            typeof p.name === "string" &&
            typeof p.in === "string" && (
              <ParameterInput
                key={[p.in, p.name].join(".")}
                {...p}
                in={p.in}
                name={p.name}
              />
            ),
        )}
      </ol>
    </details>
  );
}
