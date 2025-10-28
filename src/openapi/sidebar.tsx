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
} from "@sane-ts/shadcn-ui";
import { Mail } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import type { OperationContext } from "#openapi/context";
import { renderSidebarContent } from "#openapi/sidebar-content";

function renderLicense(license?: OpenAPIV3_1.LicenseObject) {
  if (!license) return null;
  if (!Object.values(license).join("").trim()) return null;

  // TODO derive license url from identifier from https://spdx.org/licenses/
  // https://spec.openapis.org/oas/latest.html#license-object
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a target={"_blank"} href={license.url}>
          License <i>{license.name}</i>
        </a>
      </SidebarMenuButton>
      <SidebarMenuBadge>{license.identifier}</SidebarMenuBadge>
    </SidebarMenuItem>
  );
}

function renderContact(contact?: OpenAPIV3_1.ContactObject) {
  if (!contact) return null;
  if (!Object.values(contact).join("").trim()) return null;

  const mailto = contact.email && `mailto:${contact.email}`;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a target={"_blank"} href={contact.url || mailto}>
          {contact.name || contact.url || contact.email}
        </a>
      </SidebarMenuButton>
      {mailto && (
        <SidebarMenuAction asChild>
          <a href={mailto}>
            <Mail />
          </a>
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  );
}

export function SideBar({
  spec,
  opId,
  setOpId,
}: {
  spec: OpenAPIV3_1.Document;
  opId: OperationContext | undefined | null;
  setOpId: (id: OperationContext | undefined | null) => void;
}) {
  const { info = {} } = spec;

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenuButton
          isActive={opId === undefined}
          className="block"
          asChild
        >
          <h1
            className="h-fit text-xl"
            onClick={() => {
              setOpId(undefined);
            }}
          >
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
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderSidebarContent("by-tag", spec, opId, setOpId)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {spec.components?.securitySchemes && (
            <SidebarMenuItem
              onClick={() => {
                setOpId(null);
              }}
            >
              <SidebarMenuButton>Security</SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {info.termsOfService && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a target="_blank" href={info.termsOfService}>
                  Terms of Service
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {spec.jsonSchemaDialect && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a target="_blank" href={spec.jsonSchemaDialect}>
                  JSON Schema Dialect
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {renderContact(info.contact)}
          {renderLicense(info.license)}
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
