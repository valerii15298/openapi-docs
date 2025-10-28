import {
  Button,
  cn,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@sane-ts/shadcn-ui";

import {
  EditorContext,
  type EditorCtx,
  type EditorDefaultOpts,
  useEditorContext,
  useEditorState,
} from "#json-editor/context";
import { EditorMode } from "#json-editor/enums";
import { MonacoEditor } from "#json-editor/monaco-editor";
import { TreeEditor } from "#json-editor/tree-editor";
import { deepGet } from "#json-editor/utils";

function EditorContent({
  schema,
  validate,
  ...props
}: Omit<React.ComponentProps<"div">, "value"> & {
  schema?: object;
  validate?: (value: string) => Promise<void>;
}) {
  const ctx = useEditorContext();
  if (ctx.mode === EditorMode.tree) {
    return (
      <div
        className={cn("overflow-auto", ctx.readOnly && "pl-1", props.className)}
      >
        <TreeEditor
          flat
          className="w-max min-w-full font-mono text-sm"
          path={ctx.path}
          data={deepGet(ctx.data, ctx.path)}
        />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (ctx.mode === EditorMode.code) {
    return (
      <MonacoEditor
        readOnly={ctx.readOnly}
        value={deepGet(ctx.data, ctx.path)}
        onValueChangeAsync={validate}
        format={ctx.format}
        className={cn(props.className)}
        schema={ctx.path.length ? undefined : schema}
      />
    );
  }

  return null;
}

type EditorProps<TData = unknown> = {
  validate?: (value: string) => Promise<void>;
  schema?: object;
} & Omit<React.ComponentProps<typeof ResizablePanelGroup>, "direction"> &
  (
    | { default?: EditorDefaultOpts<TData>; ctx?: undefined }
    | { ctx?: EditorCtx<TData>; default?: undefined }
  );

export function Editor<TData = unknown>({
  default: defaultValues,
  ctx: context,
  validate,
  schema,
  children,
  ...props
}: EditorProps<TData>) {
  const defaultCtx = useEditorState<TData>(defaultValues);

  const ctx = context ?? defaultCtx;

  return (
    // @ts-expect-error TS can't infer generic type for context provider
    <EditorContext key={JSON.stringify([ctx.format, ...ctx.path])} value={ctx}>
      <ResizablePanelGroup {...props} direction="vertical">
        <ResizablePanel className="flex flex-col">
          {children}
          <EditorContent
            className="min-h-0 flex-1"
            schema={schema}
            validate={validate}
          />
        </ResizablePanel>
        <ResizableHandle hidden={!ctx.error} className="mt-1" />
        <ResizablePanel
          maxSize={ctx.error ? 50 : 0}
          minSize={ctx.error ? 10 : 0}
          className={cn(ctx.error && "p-1")}
        >
          <Button
            variant={"outline"}
            size={"sm"}
            className="mb-1 w-full cursor-pointer"
            onClick={() => {
              const { mode } = ctx;
              ctx.setMode(EditorMode.tree);
              setTimeout(() => {
                ctx.setMode(mode);
              });
              ctx.setError(null);
            }}
          >
            Reset
          </Button>
          {ctx.error}
        </ResizablePanel>
      </ResizablePanelGroup>
    </EditorContext>
  );
}
