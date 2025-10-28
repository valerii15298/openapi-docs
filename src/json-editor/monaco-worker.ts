export function setupMonacoWorkers() {
  globalThis.MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
      if (label === "json") {
        return new Worker(
          new URL(
            "monaco-editor/esm/vs/language/json/json.worker.js",
            import.meta.url,
          ),
          { type: "module" },
        );
      }
      if (label === "yaml") {
        return new Worker(
          new URL("monaco-yaml/yaml.worker.js", import.meta.url),
          { type: "module" },
        );
      }
      return new Worker(
        new URL(
          "monaco-editor/esm/vs/editor/editor.worker.js",
          import.meta.url,
        ),
        { type: "module" },
      );
    },
  };
}
