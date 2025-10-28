/* eslint-disable @typescript-eslint/no-use-before-define */
import { Badge } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import type { ReactNode } from "react";

import { Description } from "#description";
import { preventDoubleClick } from "#json-editor/utils";

interface ISchema<Slots = object> {
  schema?: OpenAPIV3_1.SchemaObject;
  path: string[];
  required?: boolean;
  children?: ReactNode | undefined;
  slots?: Slots;
  name?: string;
  setEditPath?: (path: string[]) => void;
  depth?: number;
  visited: Map<unknown, string[]>;
}

function renderHeader(p: ISchema) {
  if (!p.schema) return null;
  if (typeof p.schema === "boolean") return null;

  const name = p.name ?? p.path.at(-1);
  const type = Array.isArray(p.schema.type)
    ? p.schema.type.join(" | ")
    : p.schema.type;
  const nameElement = p.schema.deprecated ? <s>{name}</s> : name;
  const format = p.schema.format && (
    <Badge variant={"outline"}>{p.schema.format}</Badge>
  );

  return (
    <>
      {name && (
        <Badge className="text-sm font-bold">
          {nameElement}
          {p.required && <b className="text-destructive">*</b>}
        </Badge>
      )}
      {type}
      {format}
      {p.children}
      <Badge hidden={!p.schema.title} variant={"secondary"}>
        {p.schema.title}
      </Badge>
    </>
  );
}

function renderSubHeader({ schema, path = [] }: ISchema) {
  if (!schema) return null;
  if (typeof schema === "boolean") return null;

  const key = "enum";
  const allowedValues = schema[key] && (
    <p className="flex flex-wrap items-center gap-1">
      Allowed values:{" "}
      {schema[key].map((v) => (
        <Badge variant="secondary" key={[...path, key, v].join("-")} asChild>
          <code>{JSON.stringify(v)}</code>
        </Badge>
      ))}
    </p>
  );

  return <>{allowedValues}</>;
}

function renderChildren({
  schema,
  path = [],
  setEditPath,
  visited,
}: ISchema): ReactNode {
  if (!schema) return null;
  if (typeof schema === "boolean") return null;

  if (schema.type === "object") {
    const key = "properties";
    const properties = schema[key] ?? {};
    const circular = visited.get(properties);
    if (circular) {
      const name = key;
      const loc =
        [...path, key].slice(circular.length).reverse().join(" -> ") || "root";
      return (
        <i>
          <Badge variant={"secondary"} className="mr-1 text-sm">
            {name}
          </Badge>
          Circular reference to {loc}
        </i>
      );
    }
    visited.set(properties, [...path, key]);

    return (
      <ul className={`mt-2 grid gap-5 ${path.length ? "ml-4" : ""}`}>
        {Object.entries(properties).map(([prop, value]) => (
          <li key={prop}>
            {render({
              setEditPath,
              schema: value,
              path: [...path, key, prop],
              required: schema.required?.includes(prop),
              visited,
            })}
          </li>
        ))}
      </ul>
    );
  }

  if (schema.type === "array") {
    const key = "items";
    const el = render({
      setEditPath,
      schema: schema[key],
      path: [...path, key],
      required: schema.required?.includes(key),
      visited,
    });
    return el;
  }
  return null;
}

const headersMap: Record<string, "h3" | "h4" | "h5" | "h6"> = {
  0: "h3", // should be bold for type field when no name in root schema
  1: "h4",
  2: "h5",
  3: "h6",
};

function render(p: ISchema<{ header?: ReactNode }>) {
  if (!p.schema) return null;
  if (typeof p.schema === "boolean") return null;

  const { visited } = p;

  const circular = visited.get(p.schema);
  if (circular) {
    const name = p.path.at(-1);
    const loc = p.path.slice(circular.length).reverse().join(" -> ") || "root";
    return (
      <i className="ml-4">
        <Badge className="mr-1 text-sm font-bold">{name}</Badge>
        Circular reference to {loc}
      </i>
    );
  }
  visited.set(p.schema, p.path);

  const subHeader = renderSubHeader(p);
  const nested = renderChildren({ ...p, visited });
  const depth = p.depth ?? p.path.length;

  const isObject = p.schema.type === "object";
  const arrayType =
    p.schema.type === "array" &&
    typeof p.schema.items === "object" &&
    p.schema.items.type;

  // const isArrayCollapsible = ["object", "array"].includes(arrayType as string);
  // const collapsible = depth && (isObject || isArrayCollapsible);
  const collapsible = depth && (isObject || arrayType);

  const Comp = headersMap[depth] || "h6";
  const header = (
    <Comp className={`inline-flex flex-wrap gap-2 ${depth ? "my-1" : ""}`}>
      {renderHeader({ ...p, children: p.slots?.header })}
    </Comp>
  );
  const body = (
    <>
      {subHeader}
      {p.children}
      <Description {...p.schema} path={p.path} />
      {nested}
    </>
  );

  if (!collapsible) {
    return (
      <div className={depth ? "ml-3.5" : ""}>
        {header}
        {body}
      </div>
    );
  }

  return (
    <details>
      <summary
        onMouseDown={preventDoubleClick}
        className="w-fit cursor-pointer items-center"
      >
        {header}
      </summary>
      <div className="border-accent ml-1 border-l pl-3">{body}</div>
    </details>
  );
}

export const jsonSchema = {
  renderHeader,
  renderSubHeader,
  renderChildren,
  render,
};
