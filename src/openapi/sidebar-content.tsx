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
} from "@sane-ts/base-shadcn";
import { ChevronRight } from "@sane-ts/base-shadcn/lucide";

import { methods } from "#openapi/methods";
import type { OpenAPIV3_1 } from "#types/index";

function renderFlat(
  doc: OpenAPIV3_1.Document,
  path: string[],
  setPath: (path: string[]) => void,
) {
  const paths = Object.entries(doc.paths ?? {});
  return (
    <SidebarMenu>
      {paths.flatMap(([pathname, pathItem]) =>
        methods.map((method) => {
          const op = pathItem[method];
          if (!op) return null;
          const opPath = ["paths", pathname, method];
          const isActive = JSON.stringify(path) === JSON.stringify(opPath);

          return (
            <SidebarMenuItem
              key={`${method}-${pathname}`}
              onClick={() => setPath(opPath)}
            >
              <SidebarMenuButton isActive={isActive}>
                {op.summary || `${method} ${pathname}`}
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
  path: string[],
  setPath: (path: string[]) => void,
) {
  const operations = Object.entries(doc.paths ?? {})
    .flatMap(([path, item]) =>
      methods.flatMap((m) => {
        const op = item[m];
        return op?.tags?.map((tag) => ({ ...op, method: m, path, tag }));
      }),
    )
    .filter((op) => !!op);
  const byTag = Object.groupBy(operations, (o) => o.tag);

  const [prefix, pathname, method] = path;
  const activeOp =
    prefix === "paths" && pathname?.startsWith("/") && method
      ? doc.paths?.[pathname]?.[method as OpenAPIV3_1.HttpMethod]
      : null;
  return (
    <SidebarMenu>
      {Object.entries(byTag).map(([tag, ops]) => (
        <Collapsible
          key={tag}
          render={
            <SidebarMenuItem>
              <CollapsibleTrigger
                className={"group"}
                render={
                  <SidebarMenuButton isActive={activeOp?.tags?.includes(tag)}>
                    {tag}
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open:rotate-90" />
                  </SidebarMenuButton>
                }
              />
              <CollapsibleContent>
                <SidebarMenuSub>
                  {ops?.map((op) => (
                    <SidebarMenuSubItem key={`${op.method}-${op.path}`}>
                      <SidebarMenuSubButton
                        render={(props) => <button type="button" {...props} />}
                        isActive={
                          !!activeOp &&
                          method === op.method &&
                          pathname === op.path
                        }
                        onClick={() => setPath(["paths", op.path, op.method])}
                        className="min-h-fit min-w-full cursor-pointer py-1"
                      >
                        {op.summary || `${op.method} ${op.path}`}
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          }
          className="group/collapsible"
        />
      ))}
    </SidebarMenu>
  );
}

// eslint-disable-next-line @typescript-eslint/max-params
export function renderSidebarContent(
  type: "flat" | "by-tag",
  doc: OpenAPIV3_1.Document,
  path: string[],
  setPath: (path: string[]) => void,
) {
  if (type === "by-tag") {
    return renderByTag(doc, path, setPath);
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type === "flat") {
    return renderFlat(doc, path, setPath);
  }

  return null;
}
