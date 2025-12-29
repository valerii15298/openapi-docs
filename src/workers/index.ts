const json = () =>
  new Worker(new URL("./json.js", import.meta.url), { type: "module" });

const yaml = () =>
  new Worker(new URL("./yaml.js", import.meta.url), { type: "module" });

const editor = () =>
  new Worker(new URL("./editor.js", import.meta.url), { type: "module" });

export const workers = { json, yaml, editor } as const;

export function getWorker(_: string, label: string) {
  if (label in workers) {
    return workers[label as keyof typeof workers]();
  }
  return workers.editor();
}

export const MonacoEnvironment = { getWorker };
