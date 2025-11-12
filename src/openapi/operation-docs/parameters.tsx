import { Badge } from "@sane-ts/shadcn-ui";

import { Description } from "#description";
import { preventDoubleClick } from "#json-editor/utils";
import { RenderJSONSchema } from "#json-schema";
import { useOpenAPI, useOperation } from "#openapi/context";
import { methodClassNamesMap } from "#openapi/methods";

export function ParametersDocs() {
  const o = useOperation();
  const { resolveRefObj } = useOpenAPI();
  const key = "parameters";
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
  if (!o[key]?.length) {
    return <div>{header}</div>;
  }
  return (
    <details open>
      <summary
        onMouseDown={preventDoubleClick}
        className="flex cursor-pointer items-center gap-2"
      >
        {header}
      </summary>
      <ul className="border-accent ml-1 grid gap-4 border-l pt-3">
        {o[key]
          .map((p) => resolveRefObj(p))
          .map((p, idx) => {
            const path = [...o.path, key, idx.toString()];
            const id = o.makeId(path);
            return (
              <li key={id} id={id} className={`grid gap-1`}>
                <RenderJSONSchema
                  {...{
                    ...p,
                    schema: p?.schema,
                    path: [...path, "schema"],
                    children: <Description {...p} path={path} />,
                    depth: 1,
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
                    resolveRef<T>($ref: string) {
                      return resolveRefObj({ $ref }) as T;
                    },
                  }}
                />
              </li>
            );
          })}
      </ul>
    </details>
  );
}
