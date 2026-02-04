import { Badge, cn } from "@sane-ts/base-shadcn";
import type { ReactNode } from "react";

import { Description } from "#description";
import { K } from "#openapi/const";
import { resolveSchema } from "#schema";
import type { OpenAPIV3_1 } from "#types/index";
import { Collapse } from "#util";

interface ISchema<Slots = object> {
  schema?: OpenAPIV3_1.Schema;
  path: string[];
  required?: boolean;
  children?: ReactNode | undefined;
  slots?: Slots;
  name?: string;
  setEditPath?: (path: string[]) => void;
  depth?: number;
  source: object;
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
  schema = resolveSchema(schema ?? {}, p.source);
  if (typeof schema !== "object") {
    schema = {};
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
      {schema[K.enum]?.map((v, i) => (
        <Badge
          variant="secondary"
          key={i}
          render={<code>{JSON.stringify(v)}</code>}
        />
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
      <div className={cn(depth && "ml-4")}>
        {header}
        {body}
      </div>
    );
  }

  return <Collapse header={header} children={body} />;
}
