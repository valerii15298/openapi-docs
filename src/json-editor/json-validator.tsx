import { Ajv2020 as Ajv } from "ajv/dist/2020.js";
import formatsPlugin from "ajv-formats";

import { markdownKeyword } from "#const";

const ajv = new Ajv({
  formats: { "media-range": true, iri: true },
  strictTypes: false,
  allowMatchingProperties: true,
  keywords: [markdownKeyword],
  loadSchema: (uri) =>
    // console.log({ uri });
    fetch(uri).then((res) => res.json()),
});

formatsPlugin.default(ajv);

export { ajv };
