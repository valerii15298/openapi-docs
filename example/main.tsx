/// <reference types="vite/client" />
import "./index.css";
import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setupMonacoWorkers, Playground, HttpProxyContext } from "openapi-docs";
import { spec } from "./spec.js";
import { ThemeProvider } from "@sane-ts/shadcn-ui";

setupMonacoWorkers();

const app = (
  <ThemeProvider>
    <HttpProxyContext
      value={{
        url: import.meta.env.VITE_OPENAPI_HTTP_PROXY_URL as string,
        urlHeader: import.meta.env.VITE_OPENAPI_HTTP_PROXY_URL_HEADER as string,
      }}
    >
      <Playground defaultSpec={spec} />
    </HttpProxyContext>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>{app}</StrictMode>,
);
