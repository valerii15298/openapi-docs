import { Button, Separator } from "@sane-ts/shadcn-ui";

import { K } from "#openapi/const";
import { useOpenAPI, useOperation, useOperationState } from "#openapi/context";
import { Content } from "#openapi/operation-docs/content";
import { ParametersDocs } from "#openapi/operation-docs/parameters";
import { Collapse } from "#util";

function RequestBodyDocs() {
  const key = K.requestBody;
  const { resolveRefObj } = useOpenAPI();
  const o = useOperation();
  const { requestContent, setRequestContent } = useOperationState();

  const requestBody = resolveRefObj(o[key]);
  if (!requestBody) return null;

  const required = (
    <i
      hidden={!requestBody.required}
      title="required"
      className="text-destructive"
    >
      *
    </i>
  );

  const header = (
    <h3 className="text-2xl font-semibold tracking-tight">Body {required}</h3>
  );

  const body = (
    <Content
      {...requestBody}
      value={requestContent}
      onValueChange={setRequestContent}
      path={[...o.path, key]}
    />
  );

  return <Collapse header={header} className="mt-4" children={body} />;
}

export function RequestDocs() {
  const o = useOperation();
  const id = `request-${o.makeId(o.path)}`;
  return (
    <section id={id}>
      <Button
        variant={"link"}
        asChild
        className="p-0 text-3xl font-semibold tracking-tight"
      >
        <h2>
          <a href={`#${id}`}>Request</a>
        </h2>
      </Button>
      <Separator className="mt-0.5 mb-2" />
      <ParametersDocs />
      <RequestBodyDocs />
    </section>
  );
}
