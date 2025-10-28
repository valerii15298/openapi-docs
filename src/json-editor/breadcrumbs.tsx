import {
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@sane-ts/shadcn-ui";
import { Fragment } from "react";

import { useEditorContext } from "#json-editor/context";
import { deepGet } from "#json-editor/utils";

export function EditorBreadcrumbs() {
  const ctx = useEditorContext();

  return (
    <Breadcrumb className="p-1">
      <BreadcrumbList className="gap-1! [&_svg]:size-4!">
        {["Root", ...ctx.path].map((part, idx) => {
          const path = ctx.path.slice(0, idx);
          const value = deepGet(ctx.data, path);

          let item = <BreadcrumbLink>{part}</BreadcrumbLink>;
          if (idx === 0) {
            item = <Badge variant={"secondary"}>{part}</Badge>;
          }
          if (idx === ctx.path.length) {
            item = <BreadcrumbPage>{part}</BreadcrumbPage>;
          }

          return (
            <Fragment key={idx}>
              <BreadcrumbItem
                onClick={() => {
                  ctx.setPath(path);
                }}
                className="cursor-pointer"
              >
                {item}
              </BreadcrumbItem>

              {typeof value === "object" && value && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="hover:text-foreground data-[state=open]:text-foreground cursor-pointer [&_svg]:transition-all data-[state=open]:[&_svg]:rotate-90"
                  >
                    <BreadcrumbSeparator />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {Object.keys(value).map((k) => (
                      <DropdownMenuItem
                        onClick={() => {
                          ctx.setPath([...path, k]);
                        }}
                        key={k}
                      >
                        {k}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
