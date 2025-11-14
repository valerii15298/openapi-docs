import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { Description } from "#description";
import { RenderJSONSchema } from "#json-schema";
import { K } from "#openapi/const";
import { useOpenAPI, useOperation } from "#openapi/context";

const key = K.content;
export function Content(props: {
  description?: string;
  content?: Record<string, OpenAPIV3_1.MediaTypeObject>;

  path: string[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  const entries = Object.entries(props[key] ?? {});

  const { setEditPath, doc } = useOpenAPI();
  const op = useOperation();

  return (
    <Tabs
      value={props.value}
      onValueChange={props.onValueChange}
      id={op.makeId(props.path)}
    >
      <Description {...props} />
      <TabsList className="ml-auto h-fit flex-wrap">
        {entries.map(([type]) => (
          <TabsTrigger key={type} value={type} className="cursor-pointer">
            {type}
          </TabsTrigger>
        ))}
      </TabsList>
      {entries.map(([type, media]) => {
        const path = [...props.path, key, type];
        return (
          <TabsContent key={type} value={type}>
            <RenderJSONSchema
              {...{
                schema: media.schema,
                path: [...path, K.schema],
                name: "",
                depth: 0,
                source: doc,
                setEditPath,
              }}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
