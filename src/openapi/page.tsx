import { Description } from "#description";
import { deepGet } from "#json-editor/utils";
import { useOpenAPI } from "#openapi/context";

export function Page() {
  const { doc, path } = useOpenAPI();
  const content = deepGet(doc, path);
  if (typeof content !== "string") {
    return <div>Page not found</div>;
  }
  return (
    <section className="p-4">
      <Description path={path} description={content} />
    </section>
  );
}
