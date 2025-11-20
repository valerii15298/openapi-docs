import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
} from "@sane-ts/shadcn-ui";
import { ChevronDown, SquarePen } from "@sane-ts/shadcn-ui/lucide";
import { sample } from "openapi-sampler";
import { useState } from "react";

import { Enum } from "#json-editor/utils";
import { K } from "#openapi/const";
import { useOpenAPI, useOperation, useOperationState } from "#openapi/context";
import { Example } from "#openapi/operation-docs/example";
import { useFormContext } from "#openapi/operation-playground/create-request";
import { SchemaInput } from "#openapi/operation-playground/schema-field";

function SelectDropdown(props: {
  value: string;
  setValue: (v: string) => void;
  options: string[];
  children?: React.ReactNode;
  label: string;
}) {
  return (
    <DropdownMenu>
      {props.children}
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{props.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={props.value}
          onValueChange={props.setValue}
        >
          {props.options.map((o) => (
            <DropdownMenuRadioItem key={o} value={o}>
              {o}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const EditorMode = Enum("Edit", "Examples");
type EditorMode = keyof typeof EditorMode;

export function RequestBodyInput() {
  const op = useOperation();
  const { requestContent: content } = useOperationState();

  const { body, setState } = useFormContext();
  const setValue = (value: unknown) => {
    setState((s) => ({ ...s, body: value }));
  };
  const { resolveRefObj, doc } = useOpenAPI();
  const requestBody = resolveRefObj(op.requestBody);
  const [mode, setMode] = useState<EditorMode>(EditorMode.Edit);

  const media = requestBody?.content?.[content];

  const [firstExample = ""] = Object.keys(media?.examples ?? {});
  const [exampleKey, setExampleKey] = useState(firstExample);

  if (!media) return null;

  const schema = resolveRefObj(media.schema);
  if (typeof schema === "boolean") return null;

  const tabs = (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(v) => {
        if (v in EditorMode) setMode(v as EditorMode);
      }}
      size={"sm"}
      variant={"outline"}
    >
      <ToggleGroupItem value={EditorMode.Edit}>
        {EditorMode.Edit}
        <SquarePen />
      </ToggleGroupItem>
      <ToggleGroupItem value={EditorMode.Examples} className="border-r-0">
        {exampleKey}
      </ToggleGroupItem>
      <SelectDropdown
        label="Examples"
        options={Object.keys(media.examples ?? {})}
        value={exampleKey}
        setValue={(v) => {
          setExampleKey(v);
          setMode(EditorMode.Examples);
        }}
      >
        <ToggleGroupItem
          asChild
          value={EditorMode.Examples}
          className="cursor-pointer p-0"
        >
          <DropdownMenuTrigger>
            <ChevronDown />
          </DropdownMenuTrigger>
        </ToggleGroupItem>
      </SelectDropdown>
    </ToggleGroup>
  );

  const example: unknown = media.example ?? sample(schema as object, {}, doc);
  const value = body === undefined ? example : body;

  const editElement =
    schema?.type && schema.type !== "string" ? (
      <SchemaInput
        schema={schema}
        field={{ value, setValue }}
        className={cn(
          "mb-0",
          (schema.type === "object" || schema.type === "array") && "h-32",
        )}
      />
    ) : (
      <code>
        <Textarea
          value={String(value)}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </code>
    );

  const path = [...op.path, K.requestBody, K.content, content];
  const exampleElement = (
    <Example
      schema={schema}
      {...media.examples?.[exampleKey]}
      path={[...path, K.examples, exampleKey]}
    />
  );

  return (
    <>
      <h4 className="flex items-end justify-between text-2xl font-semibold tracking-tight">
        Body
        {tabs}
      </h4>
      {mode === EditorMode.Edit ? editElement : exampleElement}
    </>
  );
}
