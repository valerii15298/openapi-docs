# OpenAPI Docs

## Install

```bash
pnpm add openapi-docs
```

Check out the `example` folder which contains minimal setup code.

### Cors Proxy

Optionally you can wrap OpenAPI Docs with `HttpProxyContext` provider.
You will need a backend implementation of http proxy.
Http Proxy should accept target url under `urlHeader` header name and forward the whole request to the target url. This is pretty straightforward to setup with [Cloudflare Workers](https://workers.cloudflare.com) free plan. You can check the example Cloudflare worker code in `cloudflare-http-proxy.js` file.

### Bundle Size Improvements

Monaco Editor imports all of the languages into the bundle by default via side effects.\
This creates a lot of bloat in the bundle with most of the files not needed and unused.\
To reduce number of bundled files, you can patch `editor.main.js` from monaco editor.\
If you use pnpm you can use `patches/monaco-editor.patch` with the `pnpm.patchedDependencies` field in `package.json`.\
Or manually inside `monaco-editor/esm/vs/editor/editor.main.js`
replace these:

```ts
// src/editor/editor.main.ts
import "../basic-languages/monaco.contribution.js";
import "../language/css/monaco.contribution.js";
import "../language/html/monaco.contribution.js";
import "../language/json/monaco.contribution.js";
import "../language/typescript/monaco.contribution.js";
```

with these:

```ts
// src/editor/editor.main.ts
import "./editor.api.js";
import "../basic-languages/markdown/markdown.contribution.js";
import "../basic-languages/yaml/yaml.contribution.js";
import "../language/json/monaco.contribution.js";
```
