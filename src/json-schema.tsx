import { Badge } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import type { ReactNode } from "react";

import { Description } from "#description";
import { preventDoubleClick } from "#json-editor/utils";
import { K } from "#openapi/const";

interface ISchema<Slots = object> {
  schema?: OpenAPIV3_1.SchemaObject;
  path: string[];
  required?: boolean;
  children?: ReactNode | undefined;
  slots?: Slots;
  name?: string;
  setEditPath?: (path: string[]) => void;
  depth?: number;

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolveRef: <T>(ref: string) => T | undefined;
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

function render({ name, depth, ...p }: ISchema<{ header?: ReactNode }>) {
  const { schema } = p;
  if (!schema) return null;
  if (typeof schema === "boolean") return null;

  const subHeader = renderSubHeader(p);
  depth ??= p.path.length;

  const header = (
    <div className={`inline-flex flex-wrap gap-2 ${depth ? "my-1" : ""}`}>
      {renderHeader({ ...p, children: p.slots?.header, name })}
    </div>
  );

  const properties = K.properties in schema && (
    <ul className={`mt-2 grid gap-5 ${p.path.length ? "ml-4" : ""}`}>
      {Object.entries(schema[K.properties] ?? {}).map(([prop, value]) => (
        <li key={prop}>
          {render({
            ...p,
            schema: value,
            path: [...p.path, K.properties, prop],
            required: schema.required?.includes(prop),
          })}
        </li>
      ))}
    </ul>
  );

  const items =
    K.items in schema &&
    render({ ...p, schema: schema[K.items], path: [...p.path, K.items] });

  const collapsible = depth && !!(properties || items);
  const nested = (
    <>
      {properties}
      {items}
    </>
  );

  const body = (
    <>
      {subHeader}
      {p.children}
      <Description {...schema} path={p.path} />
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
  render,
};
