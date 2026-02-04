import { Button, Separator } from "@sane-ts/base-shadcn";

import { K } from "#openapi/const";
import { useOperation } from "#openapi/context";
import { Content } from "#openapi/operation-docs/content";
import { ParametersDocs } from "#openapi/operation-docs/parameters";
import { Collapse } from "#util";

function RequestBodyDocs() {
  const o = useOperation();
  if (!o.requestBody) return null;

  const required = o.requestBody.required && (
    <i className="text-destructive">*</i>
  );

  const header = (
    <h3 className="text-2xl font-semibold tracking-tight">Body {required}</h3>
  );

  const body = <Content {...o.requestBody} path={[...o.path, K.requestBody]} />;

  return <Collapse header={header} className="mt-4" children={body} />;
}

export function RequestDocs() {
  const o = useOperation();
  const id = `request-${o.makeId(o.path)}`;
  return (
    <section id={id}>
      <Button
        variant={"link"}
        nativeButton={false}
        render={
          <h2>
            <a href={`#${id}`}>Request</a>
          </h2>
        }
        className="p-0 text-3xl font-semibold tracking-tight"
      />
      <Separator className="mt-0.5 mb-2" />
      <ParametersDocs />
      <RequestBodyDocs />
    </section>
  );
}
