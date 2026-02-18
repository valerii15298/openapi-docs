import {
  Badge,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@sane-ts/base-shadcn";
import { Mail } from "@sane-ts/base-shadcn/lucide";

import { K } from "#openapi/const";
import { useOpenAPI } from "#openapi/context";
import { renderSidebarContent } from "#openapi/sidebar-content";
import { SidebarPages } from "#openapi/sidebar-pages";
import type { OpenAPIV3_1 } from "#types/index";

function renderLicense(license?: OpenAPIV3_1.License) {
  if (!license) return null;
  if (!Object.values(license).join("").trim()) return null;

  // TODO derive license url from identifier from https://spdx.org/licenses/
  // https://spec.openapis.org/oas/latest.html#license-object
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <a target={"_blank"} href={license.url}>
            License <i>{license.name}</i>
          </a>
        }
      />
      <SidebarMenuBadge>{license.identifier}</SidebarMenuBadge>
    </SidebarMenuItem>
  );
}

function renderContact(contact?: OpenAPIV3_1.Contact) {
  if (!contact) return null;
  if (!Object.values(contact).join("").trim()) return null;

  const mailto = contact.email && `mailto:${contact.email}`;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={
          <a target={"_blank"} href={contact.url || mailto}>
            {contact.name || contact.url || contact.email}
          </a>
        }
      />
      {mailto && (
        <SidebarMenuAction
          render={
            <a href={mailto}>
              <Mail />
            </a>
          }
        />
      )}
    </SidebarMenuItem>
  );
}

export function SideBar() {
  const { path, setPath, doc: spec } = useOpenAPI();
  const { info = {} } = spec;

  const pages = spec[K["x-pages"]];

  return (
    <Sidebar className="absolute h-full">
      <SidebarHeader>
        <SidebarMenuButton
          isActive={!path.length}
          className="block"
          render={
            <h1 className="h-fit text-xl" onClick={() => setPath([])}>
              {info.title}{" "}
              <Badge
                className="text-sm"
                title="API Version"
                variant={"secondary"}
              >
                {info.version}
              </Badge>{" "}
              <Badge title="OpenAPI Specification Version" variant={"outline"}>
                OAS {spec.openapi}
              </Badge>
            </h1>
          }
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup hidden={!pages}>
          <SidebarGroupLabel>Pages</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarPages
              currPath={[K["x-pages"]]}
              pages={pages ?? {}}
              path={path}
              setPath={setPath}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderSidebarContent("by-tag", spec, path, setPath)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem
            hidden={!spec[K.components]?.[K.securitySchemes]}
            onClick={() => setPath([K.components, K.securitySchemes])}
          >
            <SidebarMenuButton>Security</SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem hidden={!info.termsOfService}>
            <SidebarMenuButton
              render={
                <a target="_blank" href={info.termsOfService}>
                  Terms of Service
                </a>
              }
            />
          </SidebarMenuItem>

          <SidebarMenuItem hidden={!spec.jsonSchemaDialect}>
            <SidebarMenuButton
              render={
                <a target="_blank" href={spec.jsonSchemaDialect}>
                  JSON Schema Dialect
                </a>
              }
            />
          </SidebarMenuItem>

          {renderContact(info.contact)}
          {renderLicense(info.license)}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
