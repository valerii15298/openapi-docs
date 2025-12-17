import {
  Button,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sane-ts/shadcn-ui";

import { K } from "#openapi/const";
import { useOperation } from "#openapi/context";
import { Content } from "#openapi/operation-docs/content";
import { useStorage } from "#storage";

export function Responses() {
  const o = useOperation();
  const path = [...o.path, K.responses];

  const entries = Object.entries(o.responses);
  const id = o.makeId(path);
  const [status, setStatus] = useStorage(id, entries[0]?.[0] ?? "");

  return (
    <Tabs value={status} onValueChange={setStatus} id={id}>
      <h2 className="flex flex-wrap items-end gap-x-3">
        <Button
          variant={"link"}
          asChild
          className="p-0 text-3xl font-semibold tracking-tight"
        >
          <a href={`#${id}`}>Response</a>
        </Button>
        <TabsList className="h-fit grow flex-wrap">
          {entries.map(([status]) => (
            <TabsTrigger
              key={status}
              value={status}
              className="cursor-pointer py-0 text-base"
            >
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </h2>
      <Separator className={"-mt-1"} />
      {entries.map(([status, resp]) => (
        <TabsContent key={status} value={status}>
          <Content {...resp} path={[...path, status]} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
