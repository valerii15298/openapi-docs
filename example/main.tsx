/// <reference types="vite/client" />
import "./index.css";
import "./style.css";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Playground, HttpProxyContext, getWorker } from "openapi-docs";
import { ThemeProvider } from "@sane-ts/shadcn-ui";
import type { OpenAPIV3_1 } from "openapi-docs/types";

globalThis.MonacoEnvironment = { getWorker };

const defaultUrl =
  "https://raw.githubusercontent.com/OAI/learn.openapis.org/refs/heads/main/examples/v3.1/tictactoe.json";

const url = import.meta.env.VITE_OPENAPI_URL || defaultUrl;

const doc: Promise<OpenAPIV3_1.Document> = fetch(url).then((r) => r.json());

const app = (
  <ThemeProvider>
    <HttpProxyContext
      value={{
        url: import.meta.env.VITE_OPENAPI_PROXY_URL as string,
        urlHeader: import.meta.env.VITE_OPENAPI_PROXY_URL_HEADER as string,
      }}
    >
      <Suspense fallback="Loading...">
        <Playground defaultDoc={doc} />
      </Suspense>
    </HttpProxyContext>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>{app}</StrictMode>,
);
