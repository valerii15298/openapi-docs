import {
  cn,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@sane-ts/shadcn-ui";

import { defaultValueMap } from "#openapi/const";
import { useOperation, useOperationState } from "#openapi/context";
import { Examples } from "#openapi/operation-docs/examples";
import { SchemaInput } from "#openapi/operation-playground/schema-field";

export function RequestBodyInput() {
  const { requestBody, path } = useOperation();
  const { requestContent } = useOperationState();
  if (!requestBody || !requestContent) return null;

  const media = requestBody.content?.[requestContent] ?? {};
  const { schema } = media;
  if (typeof schema === "boolean") return null;

  const type =
    typeof schema?.type === "string" ? schema.type : schema?.type?.[0];
  const defaultValue = type ? defaultValueMap[type] : undefined;

  const example: unknown = media.example ?? schema?.example ?? defaultValue;
  return (
    <FormField
      name={"body"}
      defaultValue={example}
      rules={{
        required: { message: "Required", value: !!requestBody.required },
      }}
      render={({ field }) => (
        <FormItem className="gap-1">
          <Tabs defaultValue="value" asChild>
            <details className="min-w-0">
              <FormLabel asChild className="cursor-pointer text-lg">
                <summary>
                  Body
                  <TabsList className="ml-auto">
                    <TabsTrigger value="value">Value</TabsTrigger>
                    <TabsTrigger value="examples">Examples</TabsTrigger>
                  </TabsList>
                </summary>
              </FormLabel>
              <TabsContent value="value">
                <FormControl className="grid">
                  {schema?.type && schema.type !== "string" ? (
                    <SchemaInput
                      schema={schema}
                      field={field}
                      className={cn(
                        "mb-0",
                        (schema.type === "object" || schema.type === "array") &&
                          "h-32",
                      )}
                    />
                  ) : (
                    <code>
                      <Textarea {...field} />
                    </code>
                  )}
                </FormControl>
                <FormMessage />
              </TabsContent>
              <TabsContent value="examples">
                <Examples
                  {...media}
                  path={[...path, "requestBody", "content", requestContent]}
                />
              </TabsContent>
            </details>
          </Tabs>
        </FormItem>
      )}
    />
  );
}
