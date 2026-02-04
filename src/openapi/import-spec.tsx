import {
  Badge,
  Button,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Textarea,
} from "@sane-ts/base-shadcn";
import { FileJson, Loader } from "@sane-ts/base-shadcn/lucide";
import { useState } from "react";
import yaml from "yaml";

import { useHttpProxy } from "#openapi/context";
import type { OpenAPIV3_1 } from "#types/index";

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
  const [loading, setLoading] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        !loading && setOpen(o);
      }}
    >
      <PopoverTrigger
        render={
          <Button
            disabled={loading}
            size={"sm"}
            variant={"outline"}
            className="size-7 cursor-pointer"
          >
            <FileJson />
          </Button>
        }
      />
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
              const req = { url: inputUri, headers: new Headers() };
              if (useProxy && proxy) {
                req.url = proxy.url;
                req.headers.set(proxy.urlHeader, inputUri);
              }
              setLoading(true);
              void fetch(req.url, { headers: req.headers })
                .then((r) => r.text())
                .then((data) => {
                  data = data.trimStart();
                  const parsed: unknown = data.startsWith("{")
                    ? JSON.parse(data)
                    : yaml.parse(data);
                  setUri(inputUri, parsed as OpenAPIV3_1.Document);
                })
                .finally(() => setLoading(false));
            }}
          >
            Import
            {loading && <Loader className="animate-spin" />}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
