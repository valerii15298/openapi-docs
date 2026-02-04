import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sane-ts/base-shadcn";

import { useEditorContext } from "#json-editor/context";
import { EditorFormat } from "#json-editor/enums";
import { deepGet } from "#json-editor/utils";

export function EditorTabs(props: React.ComponentProps<typeof SelectTrigger>) {
  const ctx = useEditorContext();

  const objectValue = typeof deepGet(ctx.data, ctx.path) !== "string";

  return (
    <Select
      disabled={!!ctx.error}
      value={ctx.format}
      onValueChange={(v) => {
        if (v !== null) ctx.setFormat(v);
      }}
    >
      <SelectTrigger {...props} className="h-full! w-20 py-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(EditorFormat).map((f) => (
          <SelectItem
            disabled={f === EditorFormat.text && objectValue}
            key={f}
            value={f}
          >
            {f}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
