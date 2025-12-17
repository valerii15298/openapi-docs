import { SidebarProvider } from "@sane-ts/shadcn-ui";
import { useState } from "react";

import { OpenAPIContext } from "#openapi/context";
import { matchRoute } from "#openapi/router";
import { SideBar } from "#openapi/sidebar";
import { createStorage, StorageContext } from "#storage";

export function Docs(ctx: OpenAPIContext) {
  const renderRoute = matchRoute(ctx.path);
  const [storage] = useState(createStorage);
  return (
    <StorageContext value={storage}>
      <OpenAPIContext value={ctx}>
        <SidebarProvider className="h-full min-h-full">
          <SideBar />
          <main className="flex-1 overflow-auto">
            {renderRoute?.(ctx.path)}
          </main>
        </SidebarProvider>
      </OpenAPIContext>
    </StorageContext>
  );
}
