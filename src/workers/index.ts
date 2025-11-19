export const workers = {
  json: () =>
    new Worker(new URL("./json.worker.js", import.meta.url), {
      type: "module",
    }),
  yaml: () =>
    new Worker(new URL("./yaml.worker.js", import.meta.url), {
      type: "module",
    }),
  graphql: () =>
    new Worker(new URL("./graphql.worker.js", import.meta.url), {
      type: "module",
    }),
  editor: () =>
    new Worker(new URL("./editor.worker.js", import.meta.url), {
      type: "module",
    }),
};

export function getWorker(_: string, label: string) {
  if (label in workers) {
    return workers[label as keyof typeof workers]();
  }
  return workers.editor();
}
