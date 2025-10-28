import {
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { Description } from "#description";

export function ExternalDocs(d: {
  externalDocs?: OpenAPIV3_1.ExternalDocumentationObject;
  path: string[];
}) {
  const key = "externalDocs";
  if (!d.externalDocs) return null;
  const path = [...d.path, key];

  return (
    <HoverCard>
      <HoverCardTrigger
        className="inline-block max-w-full tracking-wider wrap-break-word"
        asChild
      >
        <Button asChild variant="link" className="h-min p-0 whitespace-normal">
          <a href={d.externalDocs.url}>{d.externalDocs.url}</a>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent align="end">
        <Description {...d.externalDocs} path={path} />
      </HoverCardContent>
    </HoverCard>
  );
}
