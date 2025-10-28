import { Description } from "#description";
import { useOperation } from "#openapi/context";
import { ExternalDocs } from "#openapi/operation-docs/external-docs";
import { RequestDocs } from "#openapi/operation-docs/request";
import { Responses } from "#openapi/operation-docs/responses";

export function OperationDocs() {
  const o = useOperation();

  return (
    <section className={"flex flex-col gap-4"}>
      <h1 className="flex flex-wrap items-end justify-between text-4xl font-extrabold tracking-tight text-balance">
        {o.summary}
        <ExternalDocs {...o} />
      </h1>
      <Description {...o} />
      <RequestDocs />
      <Responses />
    </section>
  );
}
