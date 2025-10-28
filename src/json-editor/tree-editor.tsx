import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@sane-ts/shadcn-ui";
import { Copy, Triangle } from "@sane-ts/shadcn-ui/lucide";
import { useRef } from "react";

import { PrimitiveValue } from "#json-editor/primitive-value";
import { preventDoubleClick } from "#json-editor/utils";

function objectLabel(length: number, value: unknown) {
  if (Array.isArray(value)) {
    return `[ ${length} items ]`;
  }

  if (typeof value === "object" && value !== null) {
    return `{ ${length} keys }`;
  }

  return null;
}

type TreeEditorProps = {
  data: unknown;
  onChange?: (data: unknown) => void;
  path: string[];
  flat?: true;
  rootName?: string;
} & (React.ComponentProps<typeof Collapsible> & React.ComponentProps<"div">);

export function TreeEditor({
  data,
  path,
  flat,
  rootName,
  ...props
}: TreeEditorProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const name = rootName ?? path.at(-1);
  const isPrimitive = data === null || typeof data !== "object";

  const copyButton = (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground cursor-pointer p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      title="Copy To Clipboard"
      onClick={() => void navigator.clipboard.writeText(JSON.stringify(data))}
    >
      <Copy size={14} />
    </button>
  );

  if (isPrimitive) {
    return name ? (
      <div className="hover:bg-accent group flex items-center">
        {copyButton}
        <div className="p-2 pl-1">
          {name}: <PrimitiveValue data={data} />
        </div>
      </div>
    ) : (
      <PrimitiveValue data={data} />
    );
  }

  const entries = Object.entries(data);

  const list = entries.map(([key, value]) => (
    <TreeEditor key={key} data={value as unknown} path={[...path, key]} />
  ));

  if (flat) {
    return <div {...props}>{list}</div>;
  }
  return (
    <Collapsible>
      <div className="group hover:bg-accent flex items-center">
        {copyButton}
        <CollapsibleTrigger
          ref={triggerRef}
          onMouseDown={preventDoubleClick}
          className="flex flex-1 cursor-pointer items-center gap-1 rounded-md p-2 pl-1 -outline-offset-2 select-text focus:outline data-[state=open]:[&_svg]:rotate-180"
        >
          <Triangle size={13} className="mr-0.5 rotate-90 transition-all" />
          {name}:
          <span className="text-muted-foreground ml-1">
            {objectLabel(entries.length, data)}
          </span>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent asChild>
        <div className="relative pl-10">
          <button
            type="button"
            onClick={() => {
              triggerRef.current?.click();
              triggerRef.current?.focus();
            }}
            title="collapse"
            className="bg-border absolute left-8 h-full w-[3px] -translate-x-1/2 cursor-pointer rounded transition-all hover:w-2"
          />
          {list}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
