import {
  Badge,
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Textarea,
} from "@sane-ts/shadcn-ui";
import { FileJson, Loader } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useState } from "react";

import { useLazyAsync } from "#hooks/use-async";
import { useHttpProxy } from "#openapi/context";
import { renderWorkerError } from "#openapi/render-worker-error";
import { bundleOpenAPI } from "#openapi/validate-openapi";

const commonSpecs = [
  {
    name: "GitHub",
    url: "https://raw.githubusercontent.com/github/rest-api-description/refs/heads/main/descriptions-next/api.github.com/api.github.com.yaml",
    proxy: false,
  },
  {
    name: "Spotify",
    url: "https://developer.spotify.com/reference/web-api/open-api-schema.yaml",
    proxy: true,
  },
];

export function ImportSpec({
  defaultUri,
  setUri,
}: {
  defaultUri?: string;
  setUri: (uri: string, data: OpenAPIV3_1.Document) => void;
}) {
  const [inputUri, setInputUri] = useState(defaultUri ?? "");
  const [useProxy, setUseProxy] = useState(false);
  const proxy = useHttpProxy();
  const [open, setOpen] = useState(false);
  const [{ data: err, loading }, importSpec] = useLazyAsync(async () => {
    const result = await bundleOpenAPI(inputUri, useProxy ? proxy : undefined);
    if (result.data) {
      setUri(inputUri, result.data);
    }

    return result.error;
  });

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        !loading && setOpen(o);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          disabled={loading}
          size={"sm"}
          variant={"outline"}
          className="size-7 cursor-pointer"
        >
          <FileJson />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex flex-col items-end gap-2">
        <div className="flex w-full items-center gap-2">
          {commonSpecs.map((s) => (
            <Badge
              key={s.url}
              className="cursor-pointer"
              variant={s.url === inputUri ? "default" : "outline"}
              onClick={() => {
                setInputUri(s.url);
                setUseProxy(s.proxy);
              }}
            >
              {s.name}
            </Badge>
          ))}
        </div>
        <Textarea
          value={inputUri}
          disabled={loading}
          onChange={(e) => {
            setInputUri(e.target.value.replaceAll("\n", ""));
          }}
          placeholder="OpenAPI Spec URL"
        />
        <div className="flex w-full items-center justify-between gap-2">
          <Label hidden={!proxy} className="hover:bg-accent/50 cursor-pointer">
            <Switch checked={useProxy} onCheckedChange={setUseProxy} />
            Proxy
          </Label>
          <Button
            disabled={loading || !inputUri.trim()}
            onClick={() => {
              importSpec();
            }}
          >
            Import
            {loading && <Loader className="animate-spin" />}
          </Button>
        </div>
        {err && renderWorkerError(err)}
      </PopoverContent>
    </Popover>
  );
}
