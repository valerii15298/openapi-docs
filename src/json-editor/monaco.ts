import "monaco-editor/esm/vs/editor/edcore.main.js";

import "monaco-editor/esm/vs/language/json/monaco.contribution.js";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

const createWebWorker = monaco.editor.createWebWorker;
monaco.editor.createWebWorker = (opts) => {
  if ("label" in opts && opts.label === "yaml") {
    const worker = new Worker(
      new URL("monaco-yaml/yaml.worker.js", import.meta.url),
      { type: "module" },
    );
    worker.postMessage("ignore");
    worker.postMessage(opts.createData);
    return monaco.editor.createWebWorker({
      worker,
      host: opts.host,
      keepIdleModels: opts.keepIdleModels,
    });
  }
  if ("worker" in opts) {
    return createWebWorker(opts);
  } else {
    return createWebWorker(opts);
  }
};
export { monaco };
