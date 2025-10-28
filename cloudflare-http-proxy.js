const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://openapi-ui.netlify.app",
];

const corsHeaders = {
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "http://localhost:5173",
};

const originHeader = "Access-Control-Allow-Origin";

function getCorsHeaders(req) {
  const origin = req.headers.get("Origin");
  const headers = { ...corsHeaders };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers[originHeader] = origin;
  }
  return headers;
}
// this should match the `urlHeader` of HttpProxyContext
const headerName = "x-target-url";
export default {
  async fetch(req) {
    const { method, body } = req;
    if (method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(req), status: 204 });
    }
    const targetUrl = req.headers.get(headerName);
    const headers = new Headers(req.headers);
    headers.delete(headerName);

    const response = await fetch(targetUrl, { method, body, headers });

    const resp = new Response(response.body, response);

    Object.entries(getCorsHeaders(req)).forEach(([k, v]) => {
      resp.headers.set(k, v);
    });

    return resp;
  },
};
