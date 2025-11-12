import { Badge } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { merge } from "allof-merge";
import { type ReactNode, useState } from "react";

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
  source: unknown;

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

// eslint-disable-next-line complexity
export function RenderJSONSchema({
  children,
  depth,

  name,
  slots,
  required,
  schema,
  path,

  ...p
}: ISchema<{ header?: ReactNode }>) {
  const [open, setOpen] = useState(false);
  if (typeof schema === "boolean") return null;
  if (!schema) return null;

  const allOf = schema.allOf ?? [];
  if (K.$ref in schema && typeof schema.$ref === "string") {
    const refSchema = p.resolveRef(schema.$ref);
    if (refSchema) {
      allOf.push(refSchema as OpenAPIV3_1.SchemaObject);
      const { $ref: _, ...rest } = schema;
      schema = merge(
        { ...rest, allOf },
        {
          source: p.source,
          // eslint-disable-next-line no-console
          onMergeError: (...args) => console.error(...args),
          // eslint-disable-next-line no-console
          onRefResolveError: (...args) => console.error(...args),
        },
      ) as typeof schema;
    }
  }

  depth ??= path.length;

  const header = (
    <div className={`inline-flex flex-wrap gap-2 ${depth ? "my-1" : ""}`}>
      {renderHeader({
        ...p,
        name,
        children: slots?.header,
        required,
        schema,
        path,
      })}
    </div>
  );

  const allowedValues = K.enum in schema && (
    <p className="flex flex-wrap items-center gap-1">
      Allowed values:{" "}
      {schema[K.enum]?.map((v) => (
        <Badge variant="secondary" key={[...path, K.enum, v].join("-")} asChild>
          <code>{JSON.stringify(v)}</code>
        </Badge>
      ))}
    </p>
  );

  const properties = K.properties in schema && (
    <ul className={`mt-2 grid gap-5 ${path.length ? "ml-4" : ""}`}>
      {Object.entries(schema[K.properties] ?? {}).map(([prop, value]) => (
        <li key={prop}>
          <RenderJSONSchema
            {...p}
            schema={value}
            path={[...path, K.properties, prop]}
            required={schema.required?.includes(prop)}
          />
        </li>
      ))}
    </ul>
  );

  const items = K.items in schema && (
    <RenderJSONSchema
      {...p}
      schema={schema[K.items]}
      path={[...path, K.items]}
    />
  );

  const collapsible = depth && !!(properties || items || allowedValues);
  const nested = (
    <>
      {allowedValues}
      {properties}
      {items}
    </>
  );

  const body = (
    <>
      {children}
      <Description {...schema} path={path} />
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
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary
        onMouseDown={preventDoubleClick}
        className="w-fit cursor-pointer items-center"
      >
        {header}
      </summary>
      {open && <div className="border-accent ml-1 border-l pl-3">{body}</div>}
    </details>
  );
}
