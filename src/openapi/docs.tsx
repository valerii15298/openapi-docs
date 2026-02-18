import {
  Alert,
  AlertDescription,
  AlertTitle,
  Empty,
  EmptyHeader,
  SidebarProvider,
} from "@sane-ts/base-shadcn";
import { ErrorBoundary } from "react-error-boundary";

import { OpenAPIContext } from "#openapi/context";
import { renderPath } from "#openapi/router";
import { SideBar } from "#openapi/sidebar";
import { StorageProvider } from "#storage";

export function Docs(ctx: OpenAPIContext) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => {
        const err = Error.isError(error) ? error : new Error(String(error));
        return (
          <Empty>
            <EmptyHeader>
              <Alert variant={"destructive"}>
                <AlertTitle>{err.name}</AlertTitle>
                <AlertDescription>{err.message}</AlertDescription>
              </Alert>
            </EmptyHeader>
          </Empty>
        );
      }}
    >
      <StorageProvider buster={ctx.uri}>
        <OpenAPIContext value={ctx}>
          <SidebarProvider className="relative h-full min-h-full">
            <SideBar />
            <main className="flex-1 overflow-auto">{renderPath(ctx.path)}</main>
          </SidebarProvider>
        </OpenAPIContext>
      </StorageProvider>
    </ErrorBoundary>
  );
}
