import { Button, Label, Spinner, Switch } from "@sane-ts/shadcn-ui";
import { SendHorizonal } from "@sane-ts/shadcn-ui/lucide";
import * as ContentType from "content-type";
import { use, useState } from "react";

import { useAsyncLazy } from "#hooks/use-async";
import { K } from "#openapi/const";
import { useHttpProxy, useOperation, useResponses } from "#openapi/context";
import { methodClassNamesMap } from "#openapi/methods";
import { useRequestForm } from "#openapi/operation-playground/create-request";
import { ParametersInput } from "#openapi/operation-playground/parameters";
import { RequestSample } from "#openapi/operation-playground/request";
import { RequestBodyInput } from "#openapi/operation-playground/request-body";
import { Response, ResponseTab } from "#openapi/operation-playground/response";
import { SelectServer } from "#openapi/operation-playground/select-server";
import { Err, Ok } from "#result";
import { StorageContext } from "#storage";

function parseContentType(type?: string) {
  if (!type) return "";
  try {
    return ContentType.parse(type).type;
  } catch {
    return "";
  }
}

export function OperationPlayground() {
  const httpProxy = useHttpProxy();

  const o = useOperation();
  const storage = use(StorageContext);
  if (!storage) {
    throw new Error("StorageContext is not available");
  }

  const [proxy, setProxy] = useState(false);
  const request = useRequestForm();
  const { setStatusMediaResponse } = useResponses();

  const onSubmit = async () => {
    const minDelay = new Promise((res) => void setTimeout(res, 300));
    const req = { ...request };
    if (proxy && httpProxy) {
      req.headers = [...req.headers, [httpProxy.urlHeader, req.url]];
      req.url = httpProxy.url;
    }

    const result = await fetch(req.url, req).then(Ok, Err<Error>);
    if (!result.isOk) {
      const { name, message } = result.err;
      // eslint-disable-next-line no-alert
      alert(`${name}\n\n${message}`);
      return;
    }
    const resp = result.ok;
    const headers = Object.fromEntries(resp.headers.entries());
    const body = await resp.text().then(Ok, Err<Error>);
    const tab = body.isOk ? ResponseTab.body : ResponseTab.headers;
    const response = { status: resp.status, headers, body, tab };

    const status = resp.status.toString();
    const statusRange =
      status in o.responses ? status : `${status[0] || "0"}XX`;

    const contentType = parseContentType(headers["content-type"]);
    const mediaRange = contentType; // TODO: find matching media range
    setStatusMediaResponse(statusRange, mediaRange, response);

    const id = o.makeId([...o.path, K.responses]);
    await minDelay;
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };
  const [{ loading }, handleSubmit] = useAsyncLazy(onSubmit);
  return (
    <section className="@container flex flex-col gap-4">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <h2 className="flex justify-center">
          <SelectServer />
        </h2>

        <ParametersInput />
        {o.requestBody && <RequestBodyInput />}

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Button hidden className="flex-1" type="button" variant={"outline"}>
            Authorize
          </Button>

          <Label
            hidden={!httpProxy}
            className="hover:bg-accent/50 h-fit cursor-pointer"
          >
            <Switch checked={proxy} onCheckedChange={setProxy} />
            Proxy
          </Label>

          <Button
            disabled={loading}
            className={`${methodClassNamesMap[o.method].bg} flex-1 cursor-pointer text-base font-bold select-none`}
            type="submit"
          >
            {loading ? <Spinner /> : <SendHorizonal />}
            {o.method.toUpperCase()}
          </Button>
        </div>
      </form>
      <RequestSample />
      <Response />
    </section>
  );
}
