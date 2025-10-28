import { Badge } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { merge } from "allof-merge";

import { Description } from "#description";
import { preventDoubleClick } from "#json-editor/utils";
import { jsonSchema } from "#json-schema";
import { useOperation } from "#openapi/context";
import { methodClassNamesMap } from "#openapi/methods";

export function ParametersDocs() {
  const o = useOperation();
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
        {o[key].map((p, idx) => {
          const path = [...o.path, key, idx.toString()];
          const id = o.makeId(path);
          const isObj = ["array", "object"].includes(p.schema?.type ?? "");

          return (
            <li
              key={id}
              id={id}
              className={`grid gap-1 ${isObj ? "ml-3.5" : ""}`}
            >
              {jsonSchema.render({
                ...p,
                schema: merge(p.schema) as OpenAPIV3_1.SchemaObject,
                path: [...path, "schema"],
                children: <Description {...p} path={path} />,
                depth: 1,
                visited: new Map(),
              })}
            </li>
          );
        })}
      </ul>
    </details>
  );
}
