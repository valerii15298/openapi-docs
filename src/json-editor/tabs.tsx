import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@sane-ts/shadcn-ui";
import { ChevronDown } from "@sane-ts/shadcn-ui/lucide";

import { useEditorContext } from "#json-editor/context";
import { EditorFormat, EditorMode } from "#json-editor/enums";

function EditorFormatDropdown() {
  const ctx = useEditorContext();
  return (
    <DropdownMenu>
      <ToggleGroupItem asChild value="code" className="p-0">
        <DropdownMenuTrigger>
          <ChevronDown />
        </DropdownMenuTrigger>
      </ToggleGroupItem>
      <DropdownMenuContent>
        <DropdownMenuLabel>Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={ctx.format}
          onValueChange={(v) => {
            if (!(v in EditorFormat)) return;
            ctx.setFormat(v as EditorFormat);
            ctx.setMode(EditorMode.code);
          }}
        >
          {Object.values(EditorFormat).map((f) => (
            <DropdownMenuRadioItem key={f} value={f}>
              {f}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EditorTabs(
  props: Omit<
    React.ComponentProps<typeof ToggleGroup> & { type?: "single" },
    "type"
  >,
) {
  const ctx = useEditorContext();

  return (
    <ToggleGroup
      {...props}
      disabled={!!ctx.error}
      type="single"
      value={ctx.mode}
      onValueChange={(v) => {
        if (v in EditorMode) ctx.setMode(v as EditorMode);
      }}
      size={"sm"}
      variant={"outline"}
    >
      <ToggleGroupItem value={EditorMode.tree}>
        {EditorMode.tree}
      </ToggleGroupItem>
      <ToggleGroupItem value={EditorMode.code} className="border-r-0">
        {ctx.format}
      </ToggleGroupItem>
      <EditorFormatDropdown />
    </ToggleGroup>
  );
}
