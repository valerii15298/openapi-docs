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
