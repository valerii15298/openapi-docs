import { cn, useTheme } from "@sane-ts/shadcn-ui";
import { configureMonacoYaml, type SchemasSettings } from "monaco-yaml";
import { useEffect, useRef } from "react";

import { createAsyncSequential } from "#hooks/use-async-sequential";
import { EditorFormat } from "#json-editor/enums";
import * as monaco from "#json-editor/monaco";

const { createWebWorker } = monaco.editor;
monaco.editor.createWebWorker = (
  opts: monaco.IWebWorkerOptions | monaco.editor.IInternalWebWorkerOptions,
) => ("worker" in opts ? createWebWorker(opts) : monaco.createWebWorker(opts));

const markerToIgnore = {
  message:
    "The schema uses meta-schema features ($dynamicRef) that are not yet supported by the validator.",
  code: "769",
  owner: "json",
};

const validitySymbol = Symbol("monaco-editor-validity");

function setModelError(err: string, model: monaco.editor.ITextModel) {
  // @ts-expect-error extend the model to set custom validity
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  model[validitySymbol]?.(err);
}

function filterMarkers(modelUri: monaco.Uri) {
  const model = monaco.editor.getModel(modelUri);
  if (!model) return;
  const markers = monaco.editor.getModelMarkers({
    resource: modelUri,
    owner: markerToIgnore.owner,
  });

  const filtered = markers.filter(
    (m) =>
      m.message !== markerToIgnore.message || m.code !== markerToIgnore.code,
  );
  const msg = filtered.map((m) => m.message).join("\n");
  setModelError(msg, model);
  if (markers.length !== filtered.length) {
    monaco.editor.setModelMarkers(model, markerToIgnore.owner, filtered);
  }
}
monaco.editor.onDidChangeMarkers((e) => {
  e.forEach((uri) => {
    filterMarkers(uri);
  });
});

monaco.json.jsonDefaults.setDiagnosticsOptions({
  enableSchemaRequest: true,
  schemas: [],
});

let yamlSchemas: SchemasSettings[] = [];

const monacoYaml = configureMonacoYaml(monaco, {
  enableSchemaRequest: true,
  schemas: yamlSchemas,
});

function setYamlSchema(schema: SchemasSettings) {
  yamlSchemas = [...yamlSchemas, schema];
  void monacoYaml.update({ schemas: yamlSchemas });
  return () => {
    yamlSchemas = yamlSchemas.filter((s) => s.uri !== schema.uri);
    void monacoYaml.update({ schemas: yamlSchemas });
  };
}

const jsonOpts = monaco.json.jsonDefaults;
function setJsonSchema(schema: SchemasSettings) {
  const { schemas = [] } = jsonOpts.diagnosticsOptions;
  jsonOpts.setDiagnosticsOptions({
    ...jsonOpts.diagnosticsOptions,
    schemas: [...schemas, schema],
  });

  return () => {
    const { schemas = [] } = jsonOpts.diagnosticsOptions;
    const newSchemas = schemas.filter((s) => s.uri !== schema.uri);
    jsonOpts.setDiagnosticsOptions({
      ...jsonOpts.diagnosticsOptions,
      schemas: newSchemas,
    });
  };
}

function setModelSchema(
  model: monaco.editor.ITextModel,
  format: EditorFormat,
  opts: { schema?: unknown; uri?: string },
) {
  let cleanup = (): void => void 0;

  if (!opts.schema && !opts.uri) return cleanup;
  if (!opts.uri) {
    const blob = new Blob([JSON.stringify(opts.schema)]);
    opts.uri = URL.createObjectURL(blob);
  }
  const fileMatch = [model.uri.toString()];
  const newSchema = { ...opts, fileMatch } as SchemasSettings;

  if (format === EditorFormat.json) {
    cleanup = setJsonSchema(newSchema);
  }
  if (format === EditorFormat.yaml) {
    cleanup = setYamlSchema(newSchema);
  }
  return () => {
    cleanup();
    if (opts.uri?.startsWith("blob:")) {
      URL.revokeObjectURL(opts.uri);
    }
  };
}

interface MonacoEditorProps {
  value?: string;
  defaultValue?: string | (() => string);
  onValueChange?: (value: string) => void;
  onError?: (error: unknown) => void;
  schema?: object;
  schemaURI?: string;
  language?: EditorFormat;
  readOnly?: boolean;
  resizable?: boolean | "label";
}

export function MonacoEditor({
  value,
  defaultValue,
  onValueChange,
  onError,
  schema,
  schemaURI,
  language = EditorFormat.json,
  readOnly,
  resizable,
  className,
  ref: _,
  ...props
}: Omit<React.ComponentProps<"div">, keyof MonacoEditorProps> &
  MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();

  const getDefaultValue =
    typeof defaultValue === "function" ? defaultValue : () => defaultValue;

  const getValue = () => value ?? getDefaultValue() ?? "";

  useEffect(() => {
    if (!elementRef.current) return;
    const controller = new AbortController();

    const modelUri = monaco.Uri.parse(`file:///${Math.random()}.${language}`);
    const model = monaco.editor.createModel(getValue(), language, modelUri);

    const editor = monaco.editor.create(elementRef.current, {
      model,
      theme: `vs-${resolvedTheme}`,
      automaticLayout: true,
      fixedOverflowWidgets: true,
      // allowOverflow: false,
      minimap: { enabled: false },
      readOnly,
      lineNumbers: "off",
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      scrollBeyondLastLine: false,
    });

    const textarea = elementRef.current.querySelector("textarea");
    if (textarea) {
      textarea.readOnly = false;
      textarea.removeAttribute("aria-hidden");
      // @ts-expect-error extend the model to set custom validity
      model[validitySymbol] = textarea.setCustomValidity.bind(textarea);
    } else {
      // eslint-disable-next-line no-console
      console.error("Monaco editor textarea not found for setting validity");
    }

    elementRef.current.addEventListener(
      "wheel",
      (e) => editor.hasTextFocus() && e.preventDefault(),
      { signal: controller.signal },
    );

    if (onValueChange) {
      const trigger = createAsyncSequential(async (data: string) => {
        try {
          onValueChange(data);
          const maxWait = 10_000;
          const delay = Math.min(Math.max(data.length / maxWait, 1), maxWait);
          await new Promise((resolve) => void setTimeout(resolve, delay));
        } catch (e) {
          onError?.(e);
        }
      });
      editor.onDidChangeModelContent(() => trigger(editor.getValue()));
    }

    editorRef.current = editor;

    const removeModelSchema = setModelSchema(model, language, {
      schema,
      uri: schemaURI,
    });
    return () => {
      controller.abort();
      removeModelSchema();
      editor.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    editorRef.current?.updateOptions({
      theme: `vs-${resolvedTheme}`,
      readOnly,
    });
  }, [readOnly, resolvedTheme]);

  useEffect(() => {
    if (value === undefined || editorRef.current?.getValue() === value) return;
    editorRef.current?.setValue(value);
  }, [value]);

  if (!resizable) {
    return <div {...props} className={className} ref={elementRef} />;
  }

  if (!("safari" in window)) {
    return (
      <div
        {...props}
        className={cn("min-h-6 resize-y overflow-hidden", className)}
        ref={elementRef}
      />
    );
  }

  const resizeLabel = resizable === "label" && "drag to resize ->";
  return (
    <div
      {...props}
      className={cn(`-mb-4 min-h-10 resize-y overflow-hidden pb-4`, className)}
    >
      <div
        className="h-full min-h-6"
        style={{ overscrollBehavior: "contain" }}
        ref={elementRef}
      />
      <div
        hidden={!resizeLabel}
        className="text-muted-foreground mr-4 h-4 text-end text-xs/4"
      >
        {resizeLabel}
      </div>
    </div>
  );
}
