import {
  Button,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@sane-ts/shadcn-ui";
import { AlignJustify, Copy, Eye, WrapText } from "@sane-ts/shadcn-ui/lucide";
import { Fragment, useState } from "react";
import { useWatch } from "react-hook-form";

import { useOperation, useOperationState } from "#openapi/context";
import { methodClassNamesMap } from "#openapi/methods";
import type { defaultValues } from "#openapi/operation-playground/create-request";
import {
  control,
  createRequest,
} from "#openapi/operation-playground/create-request";

export function RequestSample() {
  const d = useWatch({ control }) as typeof defaultValues;
  const o = useOperation();
  const { requestContent } = useOperationState();
  const req = createRequest(d, o, requestContent);

  const [preview, setPreview] = useState(false);
  type Wrap = "wrap" | "line-breaks" | undefined;
  const [wrap, setWrap] = useState<Wrap>("line-breaks");

  const wbr = wrap === "line-breaks" ? null : <wbr />;

  let className = "text-nowrap";
  if (wrap === "wrap") {
    className += " inline-block min-w-full";
  }

  const methodColor = methodClassNamesMap[req.method].text;

  const url = new URL(req.url);
  const en = preview ? (s: string) => s : encodeURIComponent;
  const searchParams = [...url.searchParams.entries()];
  const urlEl = (
    <span className={methodColor}>
      <span className={className}>{url.origin}</span>
      {wbr}
      <span className={"text-foreground text-nowrap"}>{url.pathname}</span>
      {wbr}
      {searchParams.map(([k, v], i) => (
        <span key={`${k}=${i}`} className={className}>
          <span className="text-foreground">{i === 0 ? "?" : "&"}</span>
          <span>{en(k)}</span>
          <span className={"text-foreground"}>=</span>
          <span>{en(v)}</span>
          {wbr}
        </span>
      ))}
    </span>
  );
  const headersEl = Object.entries(req.headers).map(([k, v]) => (
    <Fragment key={k}>
      <span className={className}>
        <span className={`${methodColor} text-nowrap`}>-H</span> '{k}
        <span className={methodColor}>:</span> {v}'
      </span>{" "}
    </Fragment>
  ));
  const bodyEl = req.body && (
    <>
      <span className={"text-nowrap"}>-d</span> '{req.body}'
    </>
  );
  const x = <span className={methodColor}>-X</span>;
  const curlEl = (
    <>
      curl {x} {req.method.toUpperCase()} '{urlEl}' {headersEl} {bodyEl}
    </>
  );

  const headersText = Object.entries(req.headers)
    .map(([k, v]) => `-H '${k}: ${v}'`)
    .join(" ");
  const bodyText = req.body ? `-d '${req.body}'` : "";
  const curlText = `curl -X ${req.method} '${req.url}' ${headersText} ${bodyText}`;
  return (
    <section>
      <h3 className="mb-0.5 flex gap-2 text-2xl">
        Request
        <ToggleGroup
          value={wrap}
          onValueChange={(v) => {
            setWrap(v as Wrap | undefined);
          }}
          type="single"
          size={"sm"}
        >
          <ToggleGroupItem
            title="Toggle wrapping"
            value={"wrap" satisfies Wrap}
          >
            <WrapText />
          </ToggleGroupItem>
          <ToggleGroupItem
            title="Toggle separate lines"
            value={"line-breaks" satisfies Wrap}
          >
            <AlignJustify />
          </ToggleGroupItem>
        </ToggleGroup>
        <Toggle
          size={"sm"}
          pressed={preview}
          onPressedChange={setPreview}
          title="Toggle URL preview"
        >
          <Eye />
        </Toggle>
      </h3>
      <p
        className={`bg-accent relative w-full rounded-sm ${preview ? "select-none" : ""}`}
      >
        <code className="inline-block w-full overflow-auto p-2">
          <span className="float-right h-1 w-6" />
          {curlEl}
        </code>
        <Button
          variant={"ghost"}
          className="absolute top-0 right-0 m-1 h-min w-min cursor-pointer p-1!"
          onClick={() => void navigator.clipboard.writeText(curlText)}
        >
          <Copy />
        </Button>
      </p>
    </section>
  );
}
