import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { Description } from "#description";
import { ExternalDocs } from "#openapi/operation-docs/external-docs";

export function Intro({ spec }: { spec: OpenAPIV3_1.Document }) {
  return (
    <section className="m-4 flex flex-col gap-4">
      <h1 className="flex flex-wrap items-end justify-between text-6xl font-extrabold tracking-tight text-balance">
        {spec.info?.summary}
        <ExternalDocs externalDocs={spec.externalDocs} path={[]} />
      </h1>
      <Description {...spec.info} path={["info"]} />
    </section>
  );
}
