import {
  Alert,
  AlertTitle,
  Button,
  Form,
  Label,
  Switch,
} from "@sane-ts/shadcn-ui";
import * as ContentType from "content-type";
import { useState } from "react";
import { useController, useForm } from "react-hook-form";

import { KEY } from "#openapi/const";
import {
  useHttpProxy,
  useOperation,
  useOperationState,
} from "#openapi/context";
import {
  createRequest,
  defaultValues,
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
  const o = useOperation();
  const { requestContent, setResponseStatus, setResponseContent } =
    useOperationState();
  const selected =
    o.parameters
      ?.filter((p) => p.required)
      .map((p) => [p.in, p.name].join(".")) ?? [];

  const form = useForm({ defaultValues: { ...defaultValues, selected } });
  const { field: proxyField } = useController({
    control: form.control,
    name: "proxy",
  });
  const [response, setResponse] = useState<PlaygroundResponse>();

  const onSubmit = form.handleSubmit((d) => {
    const req = createRequest(d, o, requestContent);
    if (d.proxy && httpProxy) {
      req.headers = { ...req.headers, [httpProxy.urlHeader]: req.url };
      req.url = httpProxy.url;
    }

    return fetch(req.url, req).then(
      async (resp) => {
        const headers = Object.fromEntries(resp.headers.entries());
        setResponse({ status: resp.status, headers });

        setResponseStatus(resp.status.toString());
        const contentType = resp.headers.get("content-type") || "";
        if (contentType) {
          setResponseContent(ContentType.parse(contentType).type);
        }
        const id = o.makeId([...o.path, KEY.RESPONSES]);
        document.getElementById(id)?.scrollIntoView();

        return resp.text().then(
          (body) => {
            setResponse((prev) => prev && { ...prev, body });
          },
          (error: unknown) => {
            setResponse({ error });
          },
        );
      },
      (error: unknown) => {
        setResponse({ error });
      },
    );
  });

  const errors = Object.keys(form.formState.errors);
  return (
    <section className="@container flex flex-col gap-4">
      <Form {...form}>
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => void onSubmit(e)}
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
              <Switch
                checked={proxyField.value}
                onCheckedChange={proxyField.onChange}
              />
              Proxy
            </Label>

            <Button
              className="flex-1"
              disabled={form.formState.isSubmitting}
              type="submit"
            >
              Try it
            </Button>
          </div>

          <Alert hidden={!errors.length} variant={"destructive"}>
            <AlertTitle>Invalid {errors.at(0)}</AlertTitle>
          </Alert>
        </form>
        <RequestSample />
        <ResponseSample resp={response} />
      </Form>
    </section>
  );
}
