import {
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sane-ts/shadcn-ui";
import { HelpCircle } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useController } from "react-hook-form";

import { preventDoubleClick } from "#json-editor/utils";
import { defaultValueMap, KEY } from "#openapi/const";
import { useOperation } from "#openapi/context";
import { Examples } from "#openapi/operation-docs/examples";
import { control } from "#openapi/operation-playground/create-request";
import { SchemaInput } from "#openapi/operation-playground/schema-field";

export function ParameterInput({
  schema,
  ...p
}: OpenAPIV3_1.ParameterObject & { path: string[] }) {
  const selected = useController({ name: "selected", control });

  if (!schema) return null;
  const path = [p.in, p.name];

  // const type = Array.isArray(o.type) ? o.type[0] : o.type;
  const { type } = schema;
  const defaultValue = defaultValueMap[type ?? "null"];
  const key = path.join(".");
  function toggleSelected(v: boolean) {
    const newSelected = new Set(selected.field.value);
    if (v) newSelected.add(key);
    else newSelected.delete(key);
    selected.field.onChange(Array.from(newSelected));
  }

  const example: unknown = p.example ?? schema.example ?? defaultValue;
  return (
    <FormField
      key={key}
      name={key}
      defaultValue={example}
      rules={{
        required: { message: "Required", value: !!p.required },
      }}
      render={({ field }) => (
        <FormItem
          role={path.length ? "listitem" : undefined}
          className={`group/form-item h-fit min-w-0 gap-1 ${["object", "array"].includes(schema.type ?? "") ? "col-span-full" : ""}`}
        >
          <FormLabel className="text-wrap break-all">
            <Checkbox
              disabled={p.required}
              checked={selected.field.value.includes(key)}
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
          </FormLabel>
          <FormControl className="min-w-0">
            <SchemaInput
              schema={schema}
              field={{
                ...field,
                onChange(value) {
                  // TODO replace react-hook-form with custom useState and update logic to avoid this mess
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  if (value?.nativeEvent instanceof Event) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                    value = value?.target?.value;
                  }
                  field.onChange(value);
                  const isEmpty = [null, undefined, "" as unknown].includes(
                    value,
                  );
                  toggleSelected(!isEmpty);
                },
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
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
