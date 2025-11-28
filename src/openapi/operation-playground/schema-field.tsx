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

interface FieldProps {
  value: string;
  setValue: (v: string) => void;
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
      <Select required onValueChange={field.setValue} value={field.value}>
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
        value={field.value}
        onValueChange={field.setValue}
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
    const formatMap: Record<string, React.HTMLInputTypeAttribute> = {
      "date-time": "datetime-local",
      date: "date",
    };
    if (schema.format || !richText) {
      return (
        <Input
          className={className}
          type={formatMap[schema.format ?? ""] || "text"}
          value={field.value}
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
        value={field.value}
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
      language={schema.type === "string" ? "text" : "json"}
      className={cn(className, monacoClassName)}
    />
  );
}
