import {
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@sane-ts/shadcn-ui";

import { defaultValueMap } from "#openapi/const";
import { useOpenAPI, useOperation, useOperationState } from "#openapi/context";
import { Examples } from "#openapi/operation-docs/examples";
import { useFormContext } from "#openapi/operation-playground/create-request";
import { SchemaInput } from "#openapi/operation-playground/schema-field";

export function RequestBodyInput() {
  const op = useOperation();
  const { path } = op;
  const { requestContent } = useOperationState();
  const { body, setState } = useFormContext();
  const setValue = (value: unknown) => {
    setState((s) => ({ ...s, body: value }));
  };
  const { resolveRefObj } = useOpenAPI();
  const requestBody = resolveRefObj(op.requestBody);
  if (!requestBody || !requestContent) return null;

  const media = requestBody.content?.[requestContent] ?? {};
  const schema = resolveRefObj(media.schema);
  if (typeof schema === "boolean") return null;

  const type =
    typeof schema?.type === "string" ? schema.type : schema?.type?.[0];
  const defaultValue = type ? defaultValueMap[type] : undefined;

  const example: unknown = media.example ?? schema?.example ?? defaultValue;
  const value = body === undefined ? example : body;

  return (
    <Tabs defaultValue="value">
      <h4 className="flex items-end justify-between text-lg">
        Body
        <TabsList>
          <TabsTrigger value="value">Value</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
      </h4>
      <TabsContent value="value">
        {schema?.type && schema.type !== "string" ? (
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
        )}
      </TabsContent>
      <TabsContent value="examples" asChild>
        <Examples
          {...media}
          path={[...path, "requestBody", "content", requestContent]}
        />
      </TabsContent>
    </Tabs>
  );
}
