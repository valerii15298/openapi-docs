import {
  Button,
  cn,
  Field,
  FieldLabel,
  Input,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sane-ts/base-shadcn";

import type { OpenAPIV3_1 } from "#types/index";

type IJsonSchema = Exclude<OpenAPIV3_1.Schema, boolean>;
interface FieldProps {
  value: string;
  setValue: (v: string) => void;
}
function dateTimeFromISO(iso: string) {
  if (!iso) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return "";
  }
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function dateTimeToISO(datetime: string) {
  if (!datetime) return datetime;
  const d = new Date(datetime);
  if (isNaN(d.getTime())) {
    return "";
  }
  return d.toISOString();
}

export function primitiveInput({
  field,
  schema,
  className,
  name,
}: {
  schema: IJsonSchema & { format?: string };
  field: FieldProps;
  className?: string;
  name: string;
}) {
  const { type, enum: enumValues } = schema; // TODO handle all other values

  if (type === "null") {
    return (
      <Button
        name={name}
        onClick={() => field.setValue("null")}
        size={"sm"}
        variant={"outline"}
      >
        null
      </Button>
    );
  }

  if (enumValues?.length && enumValues.every((e) => typeof e !== "object")) {
    return (
      <Select
        required
        name={name}
        onValueChange={(v) => typeof v === "string" && field.setValue(v)}
        value={field.value}
      >
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {enumValues.map((v) => (
            <SelectItem key={String(v)} value={String(v)}>
              {String(v)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (type === "boolean") {
    const options = [true, false];
    return (
      <RadioGroup
        name={name}
        className={cn("flex h-8", className)}
        value={field.value}
        onValueChange={(v) => typeof v === "string" && field.setValue(v)}
      >
        {options.map((option) => (
          <FieldLabel className="text-base" key={option.toString()}>
            <Field orientation={"horizontal"} className="h-full">
              <RadioGroupItem value={option.toString()} />
              {option.toString()}
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    );
  }
  if (type === "string" && schema.format === "date-time") {
    return (
      <Input
        name={name}
        className={className}
        type={"datetime-local"}
        value={dateTimeFromISO(field.value)}
        onChange={(e) => field.setValue(dateTimeToISO(e.target.value))}
      />
    );
  }
  if (type === "string") {
    const formatMap: Record<string, React.HTMLInputTypeAttribute> = {
      date: "date",
    };
    return (
      <Input
        name={name}
        className={className}
        type={formatMap[schema.format ?? ""] || "text"}
        value={field.value}
        onChange={(e) => {
          field.setValue(e.target.value);
        }}
      />
    );
  }
  if (type === "number" || type === "integer") {
    return (
      <Input
        name={name}
        className={className}
        min={schema.minimum}
        max={schema.maximum}
        type="number"
        step={type === "integer" ? 1 : undefined}
        value={field.value}
        onChange={(e) => {
          field.setValue(e.target.value);
        }}
      />
    );
  }

  return null;
}
