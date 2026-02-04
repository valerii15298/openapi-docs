import { ToggleGroup, ToggleGroupItem } from "@sane-ts/base-shadcn";

import { K } from "#openapi/const";
import { useOpenAPI } from "#openapi/context";
import { useStorage } from "#storage";
import type { OpenAPIV3_1 } from "#types/index";

const key = K.examples;
export function useExample(props: OpenAPIV3_1.MediaType & { path: string[] }) {
  const { resolveRefObj } = useOpenAPI();
  const path = [...props.path, key];
  const examples = Object.keys(props[key] ?? {});
  const [_exampleKey, setExampleKey] = useStorage(path, examples[0]);
  const exampleKey = _exampleKey ?? "";
  const tabs = !!examples.length && (
    <ToggleGroup
      value={[exampleKey]}
      onValueChange={([v]: string[]) =>
        typeof v === "string" && setExampleKey(v)
      }
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
