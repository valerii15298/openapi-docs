import { createContext, type ReactNode, use, useState } from "react";

import { type EditorFormat, EditorMode } from "#json-editor/enums";

export const EditorContext = createContext<EditorCtx | undefined>(undefined);
EditorContext.displayName = "EditorContext";

export type EditorCtx<TData = unknown> = ReturnType<
  typeof useEditorState<TData>
>;

export function useEditorContext() {
  const ctx = use(EditorContext);
  if (!ctx) {
    throw new Error(
      "useEditorContext must be used within an EditorContext.Provider",
    );
  }
  return ctx;
}

export interface EditorDefaultOpts<TData = unknown> {
  path?: string[];
  data?: TData;
  format?: EditorFormat;
  mode?: EditorMode;
  readOnly?: boolean;
}
export function useEditorState<TData = unknown>(
  opts: EditorDefaultOpts<TData> = {},
) {
  const [path, setPath] = useState<string[]>(opts.path ?? []);
  const [data, setData] = useState<TData>(opts.data ?? ({} as TData));
  const [error, setError] = useState<ReactNode>(null);
  const [readOnly, setReadOnly] = useState(!!opts.readOnly);
  const [mode, setMode] = useState<EditorMode>(opts.mode ?? EditorMode.code);
  const [format, setFormat] = useState<EditorFormat>(opts.format ?? "json");

  return {
    path,
    setPath,

    data,
    setData: setData as (value: TData) => void,

    error,
    setError,

    mode,
    setMode,

    format,
    setFormat,

    readOnly,
    setReadOnly,
  };
}
