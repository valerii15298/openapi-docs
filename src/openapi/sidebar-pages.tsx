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

import type { OpenAPIV3_1 } from "#types/index";

export function SidebarPages(props: {
  pages: OpenAPIV3_1.Pages;
  currPath: string[];

  path: string[];
  setPath: (path: string[]) => void;
}) {
  const { pages, currPath, path, setPath } = props;

  const MenuItem = currPath.length > 1 ? SidebarMenuSubItem : SidebarMenuItem;
  const MenuButton =
    currPath.length > 1 ? SidebarMenuSubButton : SidebarMenuButton;
  const Menu = currPath.length > 1 ? SidebarMenuSub : SidebarMenu;

  return (
    <Menu className={currPath.length === 1 ? "space-y-1" : ""}>
      {Object.entries(pages).map(([key, content]) =>
        typeof content === "string" ? (
          <MenuItem key={key} onClick={() => setPath([...currPath, key])}>
            <MenuButton
              isActive={
                JSON.stringify(path) === JSON.stringify([...currPath, key])
              }
            >
              {key}
            </MenuButton>
          </MenuItem>
        ) : (
          <Collapsible
            key={key}
            render={
              <SidebarMenuItem>
                <CollapsibleTrigger
                  className={"group"}
                  render={
                    <SidebarMenuButton
                      isActive={
                        JSON.stringify(path.slice(0, currPath.length + 1)) ===
                        JSON.stringify([...currPath, key])
                      }
                    >
                      {key}
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open:rotate-90" />
                    </SidebarMenuButton>
                  }
                />
                <CollapsibleContent>
                  <SidebarPages
                    {...props}
                    currPath={[...currPath, key]}
                    pages={content}
                  />
                </CollapsibleContent>
              </SidebarMenuItem>
            }
            className="group/collapsible"
          />
        ),
      )}
    </Menu>
  );
}
