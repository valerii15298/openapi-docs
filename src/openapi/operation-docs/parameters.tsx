import { Badge } from "@sane-ts/base-shadcn";

import { Description } from "#description";
import { RenderJSONSchema } from "#json-schema";
import { K } from "#openapi/const";
import { useOpenAPI, useOperation } from "#openapi/context";
import { methodClassNamesMap } from "#openapi/methods";
import { Collapse } from "#util";

export function ParametersDocs() {
  const o = useOperation();
  const { doc } = useOpenAPI();
  const header = (
    <span className="flex flex-wrap gap-2">
      <Badge
        className={`text-background text-base font-extrabold ${methodClassNamesMap[o.method].bg}`}
      >
        {o.method.toUpperCase()}
      </Badge>
      <Badge className="text-background border-foreground bg-violet-600 font-mono text-base font-extrabold dark:bg-violet-400">
        {o.pathname}
      </Badge>
    </span>
  );
  if (!o.parameters.length) {
    return <div>{header}</div>;
  }
  const parameters = o.parameters.map((p) => {
    const id = o.makeId(p.path);
    return (
      <li key={id} id={id} className={`grid gap-1`}>
        <RenderJSONSchema
          {...{
            ...p,
            source: doc,
            schema: p.schema,
            path: [...p.path, K.schema],
            children: <Description {...p} path={p.path} />,
            depth: 1,
          }}
        />
      </li>
    );
  });
  const body = <ul className="mt-4 grid gap-4">{parameters}</ul>;
  return <Collapse header={header} children={body} />;
}
