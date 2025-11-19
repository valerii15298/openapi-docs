import {
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sane-ts/shadcn-ui";
import { HelpCircle } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { defaultValueMap, K } from "#openapi/const";
import { useOpenAPI, useOperation } from "#openapi/context";
import { Examples } from "#openapi/operation-docs/examples";
import { useFormContext } from "#openapi/operation-playground/create-request";
import { SchemaInput } from "#openapi/operation-playground/schema-field";
import { Collapse } from "#util";

export function ParameterInput(
  p: OpenAPIV3_1.ParameterObject & { path: string[] },
) {
  const { selected, setState } = useFormContext();
  const { resolveRefObj } = useOpenAPI();

  const value = useFormContext()[p.in!][p.name!];
  const setValue = (v: unknown) =>
    setState((s) => ({ ...s, [p.in!]: { ...s[p.in!], [p.name!]: v } }));

  const schema = resolveRefObj(p.schema);
  if (!schema) return null;
  const path = [p.in, p.name];

  const { type } = schema;
  const defaultValue = defaultValueMap[type ?? "null"];
  const key = path.join(".");
  function toggleSelected(v: boolean) {
    const newSelected = new Set(selected);
    if (v) newSelected.add(key);
    else newSelected.delete(key);
    setState((s) => ({ ...s, selected: Array.from(newSelected) }));
  }

  const example: unknown = p.example ?? schema.example ?? defaultValue;
  return (
    <div
      className={`group/form-item h-fit min-w-0 gap-1 ${["object", "array"].includes(schema.type ?? "") ? "col-span-full" : ""}`}
    >
      <Label className="text-wrap break-all">
        <Checkbox
          disabled={p.required}
          checked={selected.includes(key)}
          onCheckedChange={(v) => {
            if (typeof v === "boolean") {
              toggleSelected(v);
            }
          }}
        />
        {path.at(-1)}
        <Popover>
          <PopoverTrigger
            hidden={!p.examples}
            className="data-[state=open]:text-foreground text-muted-foreground hover:text-foreground cursor-pointer rounded opacity-0 group-hover/form-item:opacity-100 data-[state=open]:opacity-100"
          >
            <HelpCircle size={16} />
          </PopoverTrigger>
          <PopoverContent
            className="resize overflow-auto"
            asChild={!Object.keys(p.examples ?? {}).length}
          >
            <Examples examples={p.examples} schema={schema} path={p.path} />
          </PopoverContent>
        </Popover>
      </Label>

      <SchemaInput
        schema={schema}
        field={{
          value: value === undefined ? example : value,
          setValue(value) {
            setValue(value);
            const isEmpty = [null, undefined, "" as unknown].includes(value);
            toggleSelected(!isEmpty);
          },
        }}
      />
    </div>
  );
}

export function ParametersInput() {
  const o = useOperation();
  const { resolveRefObj } = useOpenAPI();

  const body = (
    <ol className="mt-2 grid gap-4 @sm:grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 @7xl:grid-cols-7">
      {o.parameters
        ?.map((p) => resolveRefObj(p))
        .map(
          (p, idx) =>
            p?.schema && (
              <ParameterInput
                key={[p.in, p.name].join(".")}
                {...p}
                path={[...o.path, K.parameters, idx.toString()]}
              />
            ),
        )}
    </ol>
  );
  const header = <h4 className="text-lg font-medium">Parameters</h4>;
  const hidden = !o.parameters?.length;
  return <Collapse hidden={hidden} header={header} children={body} />;
}
