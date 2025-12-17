import path from "node:path";
import { fileURLToPath } from "node:url";
import { eslintConfig } from "@vpetryniak/eslint-config-base";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default [
  ...eslintConfig({
    gitignorePath,
    projects: ["./tsconfig.json"],
    webGlob: "src/**/*.{ts,tsx}",
  }),
  {
    ignores: [
      "*.config.{js,ts}",
      "./example",
      "./gen-*",
      "./cloudflare-http-proxy.js",
    ],
  },
  {
    rules: {
      "no-promise-executor-return": ["error", { allowVoid: true }],
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
    },
  },
];
