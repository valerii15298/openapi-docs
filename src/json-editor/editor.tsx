import {
  Alert,
  AlertDescription,
  AlertTitle,
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
import { MonacoEditor } from "#json-editor/monaco-editor";
import { deepGet } from "#json-editor/utils";

function EditorContent({
  schema,
  schemaURI,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<"div">, "value"> & {
  schema?: object;
  schemaURI?: string;
  onValueChange?: (value: unknown) => void;
}) {
  const ctx = useEditorContext();

  return (
    <MonacoEditor
      readOnly={ctx.readOnly}
      defaultValue={deepGet(ctx.data, ctx.path)}
      onValueChange={onValueChange}
      onError={(error) => {
        const { name, message } =
          error instanceof Error
            ? error
            : { name: "Error", message: String(error) };

        const jsx = (
          <Alert variant={"destructive"} className="max-h-full overflow-auto">
            <AlertTitle>{name}</AlertTitle>
            <AlertDescription className="font-mono whitespace-pre">
              {message}
            </AlertDescription>
          </Alert>
        );
        ctx.setError(jsx);
      }}
      format={ctx.format}
      className={cn(props.className)}
      schema={ctx.path.length ? undefined : schema}
      schemaURI={ctx.path.length ? undefined : schemaURI}
    />
  );
}

type EditorProps<TData = unknown> = {
  onValueChange?: (value: unknown) => void;
  schema?: object;
  schemaURI?: string;
} & Omit<React.ComponentProps<typeof ResizablePanelGroup>, "direction"> &
  (
    | { default?: EditorDefaultOpts<TData>; ctx?: undefined }
    | { ctx?: EditorCtx<TData>; default?: undefined }
  );

export function Editor<TData = unknown>({
  default: defaultValues,
  ctx: context,
  onValueChange,
  schema,
  schemaURI,
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
            schemaURI={schemaURI}
            onValueChange={onValueChange}
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
              // TODO: update monaco editor content
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
