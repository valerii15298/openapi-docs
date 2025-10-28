import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@sane-ts/shadcn-ui";
import { ChevronRight } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import type { OperationContext } from "#openapi/context";
import { methods } from "#openapi/methods";

function renderFlat(
  doc: OpenAPIV3_1.Document,
  opId: OperationContext | undefined | null,
  setOpId: (id: OperationContext | undefined | null) => void,
) {
  const paths = Object.entries(doc.paths ?? {});
  return (
    <SidebarMenu>
      {paths.flatMap(([path, pathItem]) =>
        methods.map((method) => {
          const op = pathItem?.[method];
          if (!op) return null;
          const isActive = opId?.method === method && opId.pathname === path;

          return (
            <SidebarMenuItem
              key={`${method}-${path}`}
              onClick={() => {
                setOpId({ method, pathname: path });
              }}
            >
              <SidebarMenuButton isActive={isActive}>
                {op.summary || `${method} ${path}`}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        }),
      )}
    </SidebarMenu>
  );
}

function renderByTag(
  doc: OpenAPIV3_1.Document,
  opId: OperationContext | undefined | null,
  setOpId: (id: OperationContext | undefined | null) => void,
) {
  const operations = Object.entries(doc.paths ?? {})
    .flatMap(
      ([path, item]) =>
        item &&
        methods.flatMap((m) => {
          const op = item[m];
          return op && op.tags?.map((tag) => ({ ...op, method: m, path, tag }));
        }),
    )
    .filter((op) => !!op);
  const byTag = Object.groupBy(operations, (o) => o.tag);

  const activeOp = opId && doc.paths?.[opId.pathname]?.[opId.method];
  return (
    <SidebarMenu>
      {Object.entries(byTag).map(([tag, ops]) => (
        <Collapsible key={tag} asChild className="group/collapsible">
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton isActive={activeOp?.tags?.includes(tag)}>
                {tag}
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {ops?.map((op) => (
                  <SidebarMenuSubItem key={`${op.method}-${op.path}`}>
                    <SidebarMenuSubButton
                      isActive={
                        opId?.method === op.method && opId.pathname === op.path
                      }
                      onClick={() => {
                        setOpId({ method: op.method, pathname: op.path });
                      }}
                      className="min-h-fit cursor-pointer py-1"
                    >
                      {op.summary || `${op.method} ${op.path}`}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
}

// eslint-disable-next-line @typescript-eslint/max-params
export function renderSidebarContent(
  type: "flat" | "by-tag",
  doc: OpenAPIV3_1.Document,
  opId: OperationContext | undefined | null,
  setOpId: (id: OperationContext | undefined | null) => void,
) {
  if (type === "by-tag") {
    return renderByTag(doc, opId, setOpId);
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === "flat") {
    return renderFlat(doc, opId, setOpId);
  }

  return null;
}
