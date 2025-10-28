import {
  Alert,
  AlertTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { KEY } from "#openapi/const";
import { Example } from "#openapi/operation-docs/example";

const key = KEY.EXAMPLES;
export function Examples(
  props: OpenAPIV3_1.MediaTypeObject & { path: string[] },
) {
  const entries = Object.entries(props[key] ?? {});
  if (!entries.length)
    return (
      <Alert variant={"destructive"}>
        <AlertTitle>No examples found</AlertTitle>
      </Alert>
    );

  const path = [...props.path, key];

  return (
    <Tabs defaultValue={entries.at(0)?.[0]}>
      <TabsList className="h-auto w-full flex-wrap">
        {entries.map(([name]) => (
          <TabsTrigger className="max-w-full" key={name} value={name}>
            <span className="truncate">{name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {entries.map(([name, e]) => (
        <TabsContent asChild key={name} value={name}>
          <Example {...e} schema={props.schema} path={[...path, name]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
