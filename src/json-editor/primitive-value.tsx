import { cn } from "@sane-ts/shadcn-ui";
import { useState } from "react";

import { typeColorMap } from "#json-editor/type-color-map";

type TruncatedProps = {
  data: string;
  limit?: number;
} & React.ComponentProps<"span">;
function Truncated({ data, limit = 60, ...props }: TruncatedProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <span
      {...props}
      onClick={() => {
        setIsExpanded((v) => !v);
      }}
    >
      {isExpanded || data.length < limit ? data : `${data.slice(0, limit)}...`}
    </span>
  );
}

type PrimitiveValueProps = {
  data: unknown;
} & React.ComponentProps<"span">;
export function PrimitiveValue({ data, ...props }: PrimitiveValueProps) {
  const dataType = data === null ? "null" : typeof data;
  const color = typeColorMap[dataType];

  const value = data === undefined ? "undefined" : JSON.stringify(data);

  const className = cn(color, props.className);
  return <Truncated {...props} className={className} data={value} />;
}
