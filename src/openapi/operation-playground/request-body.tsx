import {
  cn,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@sane-ts/shadcn-ui";

import { defaultValueMap } from "#openapi/const";
import { useOperation, useOperationState } from "#openapi/context";
import { Examples } from "#openapi/operation-docs/examples";
import { useFormContext } from "#openapi/operation-playground/create-request";
import { SchemaInput } from "#openapi/operation-playground/schema-field";

export function RequestBodyInput() {
  const { requestBody, path } = useOperation();
  const { requestContent } = useOperationState();
  const { body, setState } = useFormContext();
  const setValue = (value: unknown) => {
    setState((s) => ({ ...s, body: value }));
  };
  if (!requestBody || !requestContent) return null;

  const media = requestBody.content?.[requestContent] ?? {};
  const { schema } = media;
  if (typeof schema === "boolean") return null;

  const type =
    typeof schema?.type === "string" ? schema.type : schema?.type?.[0];
  const defaultValue = type ? defaultValueMap[type] : undefined;

  const example: unknown = media.example ?? schema?.example ?? defaultValue;
  const value = body === undefined ? example : body;
  return (
    <Tabs defaultValue="value" asChild>
      <details className="min-w-0">
        <Label asChild className="cursor-pointer text-lg">
          <summary>
            Body
            <TabsList className="ml-auto">
              <TabsTrigger value="value">Value</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
          </summary>
        </Label>
        <TabsContent value="value">
          <div className="grid">
            {schema?.type && schema.type !== "string" ? (
              <SchemaInput
                schema={schema}
                field={{ value, setValue }}
                className={cn(
                  "mb-0",
                  (schema.type === "object" || schema.type === "array") &&
                    "h-32",
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
          </div>
        </TabsContent>
        <TabsContent value="examples">
          <Examples
            {...media}
            path={[...path, "requestBody", "content", requestContent]}
          />
        </TabsContent>
      </details>
    </Tabs>
  );
}
