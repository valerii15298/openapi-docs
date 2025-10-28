import {
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import type { ControllerRenderProps } from "react-hook-form";

import { MonacoEditor } from "#json-editor/monaco-editor";

function getValueFromISODate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function DateTimeLocalInput({
  field,
  className,
}: {
  field: ControllerRenderProps;
  className?: string;
}) {
  return (
    <Input
      className={className}
      type={"datetime-local"}
      {...field}
      value={getValueFromISODate(String(field.value))}
      onChange={(e) => {
        const date = new Date(e.target.value);
        if (isNaN(date.getTime())) {
          field.onChange("");
        } else {
          field.onChange(date.toISOString());
        }
      }}
    />
  );
}

export function SchemaInput({
  field,
  schema,
  className,
}: {
  schema: OpenAPIV3_1.SchemaObject;
  field: ControllerRenderProps;
  className?: string;
}) {
  if (typeof schema !== "object") return null;
  if (schema.type === "object" || schema.type === "array") {
    return (
      <div
        className={cn(
          `-mb-4 min-h-10 resize-y overflow-hidden pb-4`,
          className,
        )}
      >
        <MonacoEditor
          value={field.value as unknown}
          onValueChange={field.onChange}
          schema={schema}
          onBlur={field.onBlur}
          ref={field.ref}
          className={`h-full min-h-0 min-w-0 border`}
        />
      </div>
    );
  }
  if (schema.enum?.length) {
    return (
      <Select
        required
        onValueChange={field.onChange}
        value={String(field.value)}
      >
        <SelectTrigger className={cn("w-full", className)} {...field}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {schema.enum.map((v) => (
            <SelectItem key={String(v)} value={String(v)}>
              {String(v)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (schema.type === "boolean") {
    const options = [true, false];
    return (
      <ToggleGroup
        type="single"
        className={cn("w-full", className)}
        variant={"outline"}
        value={field.value === undefined ? "" : String(field.value)}
        onValueChange={(v) => {
          field.onChange(v && JSON.parse(v));
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem key={option.toString()} value={option.toString()}>
            {option.toString()}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }
  if (schema.type === "string") {
    if (schema.format === "date-time") {
      return <DateTimeLocalInput field={field} className={className} />;
    }
    return (
      <Input
        className={className}
        type={schema.format === "date" ? "date" : "text"}
        {...field}
      />
    );
  }
  if (schema.type === "null") {
    return null;
  }
  if (schema.type === "number" || schema.type === "integer") {
    return (
      <Input
        className={className}
        min={schema.minimum}
        max={schema.maximum}
        type="number"
        {...field}
      />
    );
  }
  return null;
}
