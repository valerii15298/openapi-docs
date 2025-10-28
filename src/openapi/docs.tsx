import { SidebarProvider } from "@sane-ts/shadcn-ui";
import { dereference } from "@scalar/openapi-parser";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useEffect, useMemo, useState } from "react";

import { useAsync } from "#hooks/use-async";
import { RenderError } from "#json-editor/render-error";
import type { OperationContext } from "#openapi/context";
import { OpenAPIContext } from "#openapi/context";
import { Intro } from "#openapi/intro";
import { Operation } from "#openapi/operation";
import { SecuritySchemes } from "#openapi/security/index";
import { SideBar } from "#openapi/sidebar";

export function Docs({ doc, setEditPath }: OpenAPIContext) {
  const [opId, setOpId] = useState<OperationContext | null>();
  useEffect(() => {
    if (!opId) return;
    if (!doc.paths?.[opId.pathname]?.[opId.method]) setOpId(undefined);
  }, [doc, opId]);

  const derefSpecPromise = useMemo(() => dereference(doc), [doc]);
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

  return (
    // eslint-disable-next-line @eslint-react/no-unstable-context-value
    <OpenAPIContext value={{ doc: spec, setEditPath }}>
      <SidebarProvider className="h-full">
        <SideBar {...{ spec, opId, setOpId }} />
        <main className="flex-1 overflow-auto">
          {opId && (
            <Operation {...{ method: opId.method, pathname: opId.pathname }} />
          )}

          {opId === undefined && <Intro spec={spec} />}

          {opId === null && <SecuritySchemes spec={spec} />}
        </main>
      </SidebarProvider>
    </OpenAPIContext>
  );
}
