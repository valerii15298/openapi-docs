import {
  Button,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sane-ts/shadcn-ui";
import { startTransition } from "react";

import { KEY } from "#openapi/const";
import { useOperation, useOperationState } from "#openapi/context";
import { Content } from "#openapi/operation-docs/content";

const key = KEY.RESPONSES;
export function Responses() {
  const o = useOperation();
  const opState = useOperationState();
  const path = [...o.path, key];
  const id = o.makeId(path);
  const entries = Object.entries(o[key] || {});

  return (
    <Tabs
      value={opState.responseStatus}
      onValueChange={(v) => {
        startTransition(() => {
          opState.setResponseStatus(v);
        });
      }}
      id={id}
    >
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
        <TabsContent forceMount key={status} value={status}>
          <Content
            {...resp}
            path={[...path, status]}
            value={opState.responseContent}
            onValueChange={opState.setResponseContent}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
