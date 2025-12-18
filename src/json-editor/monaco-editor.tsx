import { cn, useTheme } from "@sane-ts/shadcn-ui";
import { configureMonacoYaml, type SchemasSettings } from "monaco-yaml";
import { useEffect, useEffectEvent, useRef } from "react";

import { createAsyncSequential } from "#hooks/use-async-sequential";
import { EditorFormat } from "#json-editor/enums";
import * as monaco from "#json-editor/monaco";
import { getWorker } from "#workers/index";

globalThis.MonacoEnvironment = { getWorker }; // TODO find a better way
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
  monaco.editor.setModelLanguage(model, format);

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
  className?: string;
  name?: string;

  hidden?: boolean;
  style?: React.CSSProperties;
}

const placeholderModel = monaco.editor.createModel("");
placeholderModel.dispose();

export function MonacoEditor({
  value,
  defaultValue,

  schema,
  schemaURI,
  language = EditorFormat.json,

  readOnly,
  resizable,
  className,
  onValueChange,
  onError,

  hidden,
  style,
}: MonacoEditorProps) {
  const divProps = { hidden, style } as const;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleValueChange = useEffectEvent(onValueChange ?? (() => void 0));
  const handleError = useEffectEvent(onError ?? (() => void 0));
  const getDefault = useEffectEvent(
    typeof defaultValue === "function" ? defaultValue : () => defaultValue,
  );

  const { resolvedTheme } = useTheme();

  const modelRef = useRef(placeholderModel);
  useEffect(() => {
    const model = monaco.editor.createModel(getDefault() ?? "");
    modelRef.current = model;

    const trigger = createAsyncSequential(async (data: string) => {
      try {
        handleValueChange(data);
        const maxWait = 10_000;
        const delay = Math.min(Math.max(data.length / maxWait, 1), maxWait);
        await new Promise((resolve) => void setTimeout(resolve, delay));
      } catch (e) {
        handleError(e);
      }
    });
    model.onDidChangeContent(() => void trigger(model.getValue()));

    return () => modelRef.current.dispose();
  }, []);

  useEffect(() => {
    const model = modelRef.current;
    if (value !== undefined && value !== model.getValue())
      model.setValue(value);
  }, [value]);

  useEffect(
    () =>
      setModelSchema(modelRef.current, language, {
        schema,
        uri: schemaURI,
      }),
    [language, schema, schemaURI],
  );

  useEffect(() => {
    if (!elementRef.current) return;

    const editor = monaco.editor.create(elementRef.current, {
      model: modelRef.current,
      automaticLayout: true,
      fixedOverflowWidgets: true,
      // allowOverflow: false,
      minimap: { enabled: false },
      lineNumbers: "off",
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      scrollBeyondLastLine: false,
    });

    textareaRef.current = elementRef.current.querySelector("textarea");

    const controller = new AbortController();
    elementRef.current.addEventListener(
      "wheel",
      (e) => editor.hasTextFocus() && e.preventDefault(),
      { signal: controller.signal },
    );

    editorRef.current = editor;
    return () => {
      editor.dispose();
      controller.abort();
    };
  }, []);

  useEffect(() => {
    editorRef.current?.updateOptions({
      theme: `vs-${resolvedTheme}`,
      readOnly,
    });

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.readOnly = !!readOnly;
    textarea.setAttribute("aria-hidden", String(!!readOnly));
    // @ts-expect-error extend the model to set custom validity
    modelRef.current[validitySymbol] = readOnly
      ? undefined
      : textarea.setCustomValidity.bind(textarea);
  }, [readOnly, resolvedTheme]);

  if (!resizable) {
    return <div {...divProps} className={className} ref={elementRef} />;
  }

  if (!("safari" in window)) {
    return (
      <div
        {...divProps}
        className={cn("min-h-6 resize-y overflow-hidden", className)}
        ref={elementRef}
      />
    );
  }

  const resizeLabel = resizable === "label" && "drag to resize ->";
  return (
    <div
      {...divProps}
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
