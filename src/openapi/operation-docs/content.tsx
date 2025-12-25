import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sane-ts/shadcn-ui";

import { Description } from "#description";
import { RenderJSONSchema } from "#json-schema";
import { K } from "#openapi/const";
import { useOpenAPI, useOperation } from "#openapi/context";
import { useStorage } from "#storage";
import type { OpenAPIV3_1 } from "#types/index";

const key = K.content;
export function Content(props: {
  description?: string;
  content?: Record<string, OpenAPIV3_1.MediaType | OpenAPIV3_1.Reference>;
  path: string[];
}) {
  const { resolveRefObj } = useOpenAPI();
  const op = useOperation();
  const entries = Object.entries(props[key] ?? {});

  const id = op.makeId([...props.path, key]);
  const initialMediaRange = entries[0]?.[0] ?? "";
  const [mediaRange, setMediaRange] = useStorage(id, initialMediaRange);

  const { setEditPath, doc } = useOpenAPI();

  return (
    <Tabs value={mediaRange} onValueChange={setMediaRange}>
      <Description {...props} />
      <TabsList className="ml-auto max-w-full justify-start overflow-auto">
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
                schema: resolveRefObj(media).schema,
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
