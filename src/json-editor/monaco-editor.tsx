import { useTheme } from "@sane-ts/shadcn-ui";
import { configureMonacoYaml, type SchemasSettings } from "monaco-yaml";
import { useEffect, useRef } from "react";

import { createAsyncSequential } from "#hooks/use-async-sequential";
import { EditorFormat, formatParse, formatStringify } from "#json-editor/enums";
import { monaco } from "#json-editor/monaco";

const markerToIgnore = {
  message:
    "The schema uses meta-schema features ($dynamicRef) that are not yet supported by the validator.",
  code: "769",
  owner: "json",
};

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
  if (markers.length !== filtered.length) {
    monaco.editor.setModelMarkers(model, markerToIgnore.owner, filtered);
  }
}
monaco.editor.onDidChangeMarkers((e) => {
  e.forEach((uri) => {
    filterMarkers(uri);
  });
});

monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
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

const jsonOpts = monaco.languages.json.jsonDefaults;
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
  value?: unknown;
  onValueChange?: (value: unknown) => void;
  onError?: (error: unknown) => void;
  schema?: object;
  schemaURI?: string;
  format?: EditorFormat;
  readOnly?: boolean;
}
export function MonacoEditor({
  value,
  onValueChange,
  onError,
  schema,
  schemaURI,
  format = EditorFormat.json,
  readOnly,
  ...props
}: React.ComponentProps<"div"> & MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const siteTheme = useTheme();
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const theme = siteTheme.theme === "system" ? systemTheme : siteTheme.theme;
  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.updateOptions({ theme: `vs-${theme}` });
  }, [theme]);

  useEffect(() => {
    if (!elementRef.current) return;

    const formattedValue = formatStringify[format](value);

    const modelUri = monaco.Uri.parse(`file:///${Math.random()}.${format}`);
    const model = monaco.editor.createModel(formattedValue, format, modelUri);

    const editor = monaco.editor.create(elementRef.current, {
      model,
      theme: `vs-${theme}`,
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

    if (onValueChange) {
      const trigger = createAsyncSequential(async (data: string) => {
        try {
          const newValue = formatParse[format](data);
          onValueChange(newValue);
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

    const removeModelSchema = setModelSchema(model, format, {
      schema,
      uri: schemaURI,
    });
    return () => {
      removeModelSchema();
      editor.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format]);

  return <div {...props} ref={elementRef} />;
}
