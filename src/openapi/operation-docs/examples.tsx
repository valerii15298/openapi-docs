import { ToggleGroup, ToggleGroupItem } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { K } from "#openapi/const";
import { useOpenAPI } from "#openapi/context";
import { useStorage } from "#storage";

const key = K.examples;
/**
 * Provide an example-selection control and the resolved example for a given media type.
 *
 * @param props - The media type object to inspect; must include a `path` array used to build the storage key and to locate the media type's `examples` property.
 * @returns An object containing:
 * - `tabs` — a ToggleGroup element for choosing among available examples, or a falsy value if no examples exist.
 * - `example` — the resolved example object for the currently selected key, or `undefined` when none is selected.
 * - `path` — the original `path` extended with the examples key and the currently selected example key.
 */
export function useExample(
  props: OpenAPIV3_1.MediaTypeObject & { path: string[] },
) {
  const { resolveRefObj } = useOpenAPI();
  const path = [...props.path, key];
  const examples = Object.keys(props[key] ?? {});
  const [_exampleKey, setExampleKey] = useStorage(path, examples[0]);
  const exampleKey = _exampleKey ?? "";
  const tabs = !!examples.length && (
    <ToggleGroup
      type="single"
      value={exampleKey}
      onValueChange={setExampleKey}
      size={"sm"}
      variant={"outline"}
      spacing={1}
      className="max-w-full flex-wrap"
    >
      {examples.map((e) => (
        <ToggleGroupItem
          className="inline max-w-full grow truncate"
          key={e}
          value={e}
          children={e}
        />
      ))}
    </ToggleGroup>
  );
  const example = resolveRefObj(props.examples?.[exampleKey]);

  return { tabs, example, path: [...path, exampleKey] };
}