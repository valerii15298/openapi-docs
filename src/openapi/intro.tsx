import { Description } from "#description";
import { useOpenAPI } from "#openapi/context";
import { ExternalDocs } from "#openapi/operation-docs/external-docs";

export function Intro() {
  const { doc: spec } = useOpenAPI();
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
