import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sane-ts/shadcn-ui";

import { useEditorContext } from "#json-editor/context";
import { EditorFormat } from "#json-editor/enums";

export function EditorTabs(props: React.ComponentProps<typeof SelectTrigger>) {
  const ctx = useEditorContext();

  return (
    <Select
      disabled={!!ctx.error}
      value={ctx.format}
      onValueChange={(v) => {
        if (v in EditorFormat) ctx.setFormat(v as EditorFormat);
      }}
    >
      <SelectTrigger {...props} className="h-full! w-20 py-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(EditorFormat).map((f) => (
          <SelectItem key={f} value={f}>
            {f}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
