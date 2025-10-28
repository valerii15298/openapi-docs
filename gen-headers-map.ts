import { marked } from "marked";
import { markdownSpecUrl } from "./src/const.ts";

const spec = await fetch(markdownSpecUrl).then((res) => res.text());

const tokens = marked.lexer(spec);

const headersMap: Record<string, string> = {};

tokens.forEach((t, idx) => {
  if (t.type === "heading") {
    const content = [t.raw];
    const name = (t.text as string).replaceAll(" ", "-").toLowerCase();
    for (let i = idx + 1; i < tokens.length; i++) {
      const nextToken = tokens[i];
      if (nextToken.type === "heading" && nextToken.depth <= t.depth) {
        break;
      }
      content.push(nextToken.raw);
    }
    headersMap[name] = content.join("");
  }
});

export { headersMap };
