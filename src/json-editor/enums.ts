import yaml from "yaml";

import { Enum } from "#json-editor/utils";

export const EditorMode = Enum("tree", "code");
export type EditorMode = keyof typeof EditorMode;

export const EditorFormat = Enum("text", "json", "yaml");
export type EditorFormat = keyof typeof EditorFormat;

export const formatParse: Record<EditorFormat, (value: string) => unknown> = {
  text: (v) => v,
  json: (v) => JSON.parse(v) as unknown,
  yaml: (v) => yaml.parse(v) as unknown,
};

export const formatStringify: Record<EditorFormat, (value: unknown) => string> =
  {
    text: (v) => String(v),
    json: (v) => JSON.stringify(v, null, 2),
    yaml: (v) => yaml.stringify(v),
  };
