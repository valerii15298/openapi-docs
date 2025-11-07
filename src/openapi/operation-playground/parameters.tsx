import {
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sane-ts/shadcn-ui";
import { HelpCircle } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { preventDoubleClick } from "#json-editor/utils";
import { defaultValueMap, KEY } from "#openapi/const";
import { useOperation } from "#openapi/context";
import { Examples } from "#openapi/operation-docs/examples";
import { useFormContext } from "#openapi/operation-playground/create-request";
import { SchemaInput } from "#openapi/operation-playground/schema-field";

export function ParameterInput({
  schema,
  ...p
}: OpenAPIV3_1.ParameterObject & { path: string[] }) {
  const { selected, setState } = useFormContext();

  const value = useFormContext()[p.in!][p.name!];
  const setValue = (v: unknown) =>
    setState((s) => ({ ...s, [p.in!]: { ...s[p.in!], [p.name!]: v } }));

  if (!schema) return null;
  const path = [p.in, p.name];

  // const type = Array.isArray(o.type) ? o.type[0] : o.type;
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

  return (
    <details open hidden={!o.parameters?.length}>
      <summary
        onMouseDown={preventDoubleClick}
        className="cursor-pointer text-lg font-medium"
      >
        Parameters
      </summary>
      <ol className="mt-2 grid gap-4 @sm:grid-cols-2 @xl:grid-cols-3 @4xl:grid-cols-4 @5xl:grid-cols-5 @6xl:grid-cols-6 @7xl:grid-cols-7">
        {o.parameters?.map(
          (p, idx) =>
            p.schema && (
              <ParameterInput
                key={[p.in, p.name].join(".")}
                {...p}
                path={[...o.path, KEY.PARAMETERS, idx.toString()]}
              />
            ),
        )}
      </ol>
    </details>
  );
}
