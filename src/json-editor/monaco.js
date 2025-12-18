import "monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js";
import "monaco-editor/esm/vs/basic-languages/graphql/graphql.contribution.js";

export * as lsp from "monaco-editor/esm/external/monaco-lsp-client/out/index.js";

export * from "monaco-editor/esm/vs/editor/editor.api2.js";
export * as json from "monaco-editor/esm/vs/language/json/monaco.contribution.js";
export { createWebWorker } from "monaco-editor/esm/vs/common/workers.js";
export { getGlobalMonaco } from "monaco-editor/esm/vs/editor/internal/initialize.js";
