import type { OpenAPIV3_1 } from "@scalar/openapi-types";

export const methods = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
  "trace",
] as OpenAPIV3_1.HttpMethods[];

export const methodClassNamesMap = {
  get: { text: "text-green-500", bg: "bg-green-500" },
  post: { text: "text-blue-500", bg: "bg-blue-500" },
  put: { text: "text-yellow-500", bg: "bg-yellow-500" },
  patch: { text: "text-pink-500", bg: "bg-pink-500" },
  delete: { text: "text-destructive", bg: "bg-destructive" },
  options: { text: "text-teal-500", bg: "bg-teal-500" },
  head: { text: "text-gray-500", bg: "bg-gray-500" },
  trace: { text: "text-purple-500", bg: "bg-purple-500" },
  connect: { text: "text-indigo-500", bg: "bg-indigo-500" },
};

export const statusColor: Record<string, string> = {
  "1xx": "text-gray-500",
  "2xx": "text-green-500",
  "3xx": "text-yellow-500",
  "4xx": "text-red-500",
  "5xx": "text-purple-500",
};
