import { marked } from "marked";
import { useMemo } from "react";

import { useOpenAPI } from "#openapi/context";

const key = "description";
export function Description(d: { description?: string; path: string[] }) {
  const { setEditPath } = useOpenAPI();

  const __html = useMemo(
    () => marked.parse(d.description || ""),
    [d.description],
  );

  if (typeof __html !== "string") {
    // eslint-disable-next-line no-console
    console.error("Description is not a string", { html: __html });
    return null;
  }

  if (!d.description) return null;
  return (
    <div
      onClick={() => setEditPath?.([...d.path, key])}
      className={`prose dark:prose-invert max-w-none ${
        setEditPath ? "hover:bg-accent cursor-pointer" : ""
      }`}
      // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{ __html }}
    />
  );
}
