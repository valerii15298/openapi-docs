import { SidebarProvider } from "@sane-ts/shadcn-ui";
import { dereference } from "@scalar/openapi-parser";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useMemo } from "react";

import { useAsync } from "#hooks/use-async";
import { RenderError } from "#json-editor/render-error";
import { OpenAPIContext } from "#openapi/context";
import { matchRoute } from "#openapi/router";
import { SideBar } from "#openapi/sidebar";

export function Docs(ctx: OpenAPIContext) {
  const derefSpecPromise = useMemo(() => dereference(ctx.doc), [ctx.doc]);
  const { data = {}, error } = useAsync(derefSpecPromise);
  const spec = data.schema as OpenAPIV3_1.Document | undefined;

  if (data.errors?.length) {
    return <pre>{JSON.stringify(data.errors, null, 2)}</pre>;
  }

  if (error) {
    return <RenderError error={error} />;
  }
  if (!spec) {
    return <div>Loading...</div>;
  }

  const renderRoute = matchRoute(ctx.path);
  return (
    // eslint-disable-next-line @eslint-react/no-unstable-context-value
    <OpenAPIContext value={{ ...ctx, doc: spec }}>
      <SidebarProvider className="h-full">
        <SideBar />
        <main className="flex-1 overflow-auto">{renderRoute?.(ctx.path)}</main>
      </SidebarProvider>
    </OpenAPIContext>
  );
}
