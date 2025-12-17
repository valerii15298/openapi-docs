import { SidebarProvider } from "@sane-ts/shadcn-ui";
import { useState } from "react";

import { OpenAPIContext } from "#openapi/context";
import { matchRoute } from "#openapi/router";
import { SideBar } from "#openapi/sidebar";
import { createStorage, StorageContext } from "#storage";

/**
 * Renders the OpenAPI documentation layout with storage and OpenAPI contexts, a sidebar, and the active route content.
 *
 * @param ctx - OpenAPI context containing the current path and related data used to determine which route to render.
 * @returns The documentation UI: StorageContext and OpenAPIContext providers wrapping a SidebarProvider, the SideBar, and the main content for the matched route.
 */
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