import { cn } from "@sane-ts/shadcn-ui";
import { Copy } from "@sane-ts/shadcn-ui/lucide";

import { typeColorMap } from "#json-editor/type-color-map";

export function CodeSample({
  code,
  wrap,
  className,
}: {
  wrap?: boolean;
  code: unknown;
  className?: string;
}) {
  if (code === undefined) return null;

  const dataType = typeof code;
  const isObject = dataType === "object";
  const text = isObject
    ? JSON.stringify(code, null, 2)
    : String(code as unknown);

  return (
    <p
      className={cn(
        `bg-accent relative w-full rounded-sm`,
        wrap ? "wrap-break-word" : "whitespace-pre",
        className,
      )}
    >
      <code
        className={`w-full ${wrap ? "" : "pr-8"} inline-block overflow-auto p-2 ${typeColorMap[dataType]}`}
      >
        <span className="float-right h-1 w-6" />
        {isObject ? <pre>{text}</pre> : text}
      </code>
      <button
        type="button"
        className="text-muted-foreground bg-accent hover:text-foreground absolute top-0 right-0 cursor-pointer px-2 pt-2 pb-1"
        onClick={() => void navigator.clipboard.writeText(text)}
      >
        <Copy size={16} />
      </button>
      <div className="text-muted-foreground -mt-4 pr-2 text-end text-sm/tight select-none">
        {dataType}
      </div>
    </p>
  );
}
