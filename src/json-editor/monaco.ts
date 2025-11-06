import "monaco-editor/esm/vs/editor/edcore.main.js";
import "monaco-editor/esm/vs/language/json/monaco.contribution.js";
import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";

import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

const { createWebWorker } = monaco.editor;
monaco.editor.createWebWorker = (opts) => {
  if ("worker" in opts) {
    return createWebWorker(opts);
  }

  const _worker = globalThis.MonacoEnvironment?.getWorker?.(
    opts.moduleId,
    opts.label ?? "monaco-editor-worker",
  );
  if (!_worker) {
    return createWebWorker(opts);
  }

  const worker = Promise.resolve(_worker).then((w) => {
    w.postMessage("ignore");
    w.postMessage(opts.createData);
    return w;
  });

  return createWebWorker({ ...opts, worker });
};

export { monaco };
