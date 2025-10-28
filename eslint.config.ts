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
    webGlob: "./src/**/*.{ts,tsx}",
  }),
  {
    ignores: ["*.config.{js,ts}", "./example", "./gen-*"],
  },
];
