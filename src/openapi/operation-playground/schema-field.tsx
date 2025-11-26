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

import { MonacoEditor } from "#json-editor/monaco-editor";

function getValueFromISODate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "";
  }
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}
interface FieldProps {
  value: unknown;
  setValue: (v: unknown) => void;
}

function DateTimeLocalInput({
  field,
  className,
}: {
  field: FieldProps;
  className?: string;
}) {
  return (
    <Input
      className={className}
      type={"datetime-local"}
      value={getValueFromISODate(String(field.value))}
      onChange={(e) => {
        const date = new Date(e.target.value);
        if (isNaN(date.getTime())) {
          field.setValue("");
        } else {
          field.setValue(date.toISOString());
        }
      }}
    />
  );
}

export function SchemaInput({
  field,
  schema,
  className,
  monacoClassName,
  richText,
}: {
  schema: OpenAPIV3_1.SchemaObject;
  field: FieldProps;
  className?: string;
  monacoClassName?: string;
  richText?: boolean;
}) {
  if (typeof schema !== "object") {
    schema = {};
  }
  if (schema.type === "null") {
    return null;
  }

  if (schema.enum?.length) {
    return (
      <Select
        required
        onValueChange={field.setValue}
        value={String(field.value)}
      >
        <SelectTrigger className={cn("w-full", className)}>
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
        value={field.value === undefined ? "" : JSON.stringify(field.value)}
        onValueChange={(v) => {
          field.setValue(v && JSON.parse(v));
        }}
      >
        {options.map((option) => (
          <ToggleGroupItem
            className="flex-1"
            key={option.toString()}
            value={option.toString()}
          >
            {option.toString()}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }

  if (schema.type === "string") {
    if (schema.format === "date-time")
      return <DateTimeLocalInput field={field} className={className} />;

    if (schema.format === "date")
      return (
        <Input
          className={className}
          type={"date"}
          value={String(field.value)}
          onChange={(e) => {
            field.setValue(e.target.value);
          }}
        />
      );

    if (!richText) {
      return (
        <Input
          className={className}
          type={"text"}
          value={String(field.value)}
          onChange={(e) => {
            field.setValue(e.target.value);
          }}
        />
      );
    }
  }
  if (schema.type === "number" || schema.type === "integer") {
    return (
      <Input
        className={className}
        min={schema.minimum}
        max={schema.maximum}
        type="number"
        value={String(field.value)}
        onChange={(e) => {
          field.setValue(e.target.value);
        }}
      />
    );
  }

  return (
    <MonacoEditor
      defaultValue={field.value}
      onValueChange={field.setValue}
      schema={schema}
      resizable
      format={schema.type === "string" ? "text" : "json"}
      className={cn(className, monacoClassName)}
    />
  );
}
