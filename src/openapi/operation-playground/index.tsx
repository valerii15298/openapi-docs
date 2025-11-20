import { Button, Label, Switch } from "@sane-ts/shadcn-ui";
import * as ContentType from "content-type";
import { useMemo, useState } from "react";

import { K } from "#openapi/const";
import {
  useHttpProxy,
  useOpenAPI,
  useOperation,
  useOperationState,
} from "#openapi/context";
import {
  createRequest,
  defaultValues,
  FormContext,
} from "#openapi/operation-playground/create-request";
import { ParametersInput } from "#openapi/operation-playground/parameters";
import { RequestSample } from "#openapi/operation-playground/request";
import { RequestBodyInput } from "#openapi/operation-playground/request-body";
import {
  type PlaygroundResponse,
  ResponseSample,
} from "#openapi/operation-playground/response";
import { SelectServer } from "#openapi/operation-playground/select-server";

export function OperationPlayground() {
  "use no memo";
  const httpProxy = useHttpProxy();
  const { resolveRefObj } = useOpenAPI();
  const o = useOperation();
  const { request, response } = useOperationState();
  const selected =
    o.parameters
      ?.map((p) => resolveRefObj(p) ?? {})
      .filter((p) => p.required)
      .map((p) => [p.in, p.name].join(".")) ?? [];

  const [state, setState] = useState({ ...defaultValues, selected });
  const { proxy } = state;
  const setProxy = (v: boolean) => {
    setState((s) => ({ ...s, proxy: v }));
  };

  const [resp, setResp] = useState<PlaygroundResponse>();

  const onSubmit = () => {
    const req = createRequest(state, o, request.contentType);
    if (state.proxy && httpProxy) {
      req.headers = { ...req.headers, [httpProxy.urlHeader]: req.url };
      req.url = httpProxy.url;
    }

    return fetch(req.url, req).then(
      async (resp) => {
        const headers = Object.fromEntries(resp.headers.entries());
        setResp({ status: resp.status, headers });

        response.setStatus(resp.status.toString());
        const contentType = resp.headers.get("content-type") || "";
        if (contentType) {
          response.setContentType(ContentType.parse(contentType).type);
        }
        const id = o.makeId([...o.path, K.responses]);
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });

        return resp.text().then(
          (body) => {
            setResp((prev) => prev && { ...prev, body });
          },
          (error: unknown) => {
            setResp({ error });
          },
        );
      },
      (error: unknown) => {
        setResp({ error });
      },
    );
  };

  const value = useMemo(() => ({ ...state, setState }), [state]);
  return (
    <FormContext value={value}>
      <section className="@container flex flex-col gap-4">
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit();
          }}
        >
          <h2 className="flex justify-center">
            <SelectServer />
          </h2>

          <ParametersInput />
          <RequestBodyInput />

          <div className="flex flex-wrap items-center gap-3">
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

            <Button className="flex-1" type="submit">
              Try it
            </Button>
          </div>
        </form>
        <RequestSample />
        <ResponseSample resp={resp} />
      </section>
    </FormContext>
  );
}
