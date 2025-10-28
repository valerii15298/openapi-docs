import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sane-ts/shadcn-ui";
import { Lock, LockOpen } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useState } from "react";

import { Description } from "#description";
import { useLocalStorage } from "#hooks/use-local-storage";

function ClientCredentials(p: {
  scheme: OpenAPIV3_1.OAuth2SecurityScheme;
  id: string;
  type: "clientCredentials" | "authorizationCode";
}) {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);

  const key = p.type;
  // const id = p.id + "-" + key;
  const [secret, setSecret] = useLocalStorage(p.id, "");
  const flow = p.scheme.flows?.[key];

  if (!flow) return null;
  return (
    <TabsContent asChild className="grid gap-2" value={key}>
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={async (e) => {
          e.preventDefault();
          const body = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
            scope: scopes.join(" "),
          });
          if (!flow.tokenUrl) return;
          const resp = await fetch(flow.tokenUrl, { method: "POST", body });
          if (!resp.ok) {
            return;
          }
          const json = (await resp.json()) as { access_token: string };
          setSecret(json.access_token);
        }}
      >
        {flow.refreshUrl && (
          <p>
            Refresh URL: <code>{flow.refreshUrl}</code>
          </p>
        )}
        <p>
          Token URL: <code>{flow.tokenUrl}</code>
        </p>
        <Label className="mt-2 grid gap-1">
          <i>Client Id:</i>
          <code>
            <Input
              name="client_id"
              autoComplete="username"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
              }}
            />
          </code>
        </Label>
        <Label className="mt-2 grid gap-1">
          <i>Client Secret:</i>
          <code>
            <Input
              name="client_secret"
              autoComplete="current-password"
              type="password"
              value={clientSecret}
              onChange={(e) => {
                setClientSecret(e.target.value);
              }}
            />
          </code>
        </Label>
        {Object.entries(flow.scopes ?? {}).map(([name, value]) => (
          <Label className="mt-1" key={name}>
            <Checkbox
              checked={scopes.includes(name)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setScopes((prev) => [...prev, name]);
                } else {
                  setScopes((prev) => prev.filter((s) => s !== name));
                }
              }}
            />
            {name}:{value}
          </Label>
        ))}
        <Button>Fetch Token</Button>
        {secret}
      </form>
    </TabsContent>
  );
}

export function OAuth2SecurityScheme({
  path,
  scheme,
}: {
  scheme: OpenAPIV3_1.OAuth2SecurityScheme;
  path: string[];
}) {
  const name = path.at(-1) || "oauth2";
  const id = name;
  // const id = name + "-" + scheme.type;
  const [secret] = useLocalStorage<string>(id, "");

  const flows = Object.keys(scheme.flows ?? {});
  return (
    <Card className="gap-0">
      <CardHeader>
        <h3 className="flex items-center gap-2">
          {secret ? <Lock /> : <LockOpen className="text-destructive" />}
          <span className="text-2xl">{name}</span>
          <Badge className="ml-auto">{scheme.type}</Badge>
        </h3>
      </CardHeader>
      <CardContent>
        <Description {...scheme} path={path} />
        <Tabs defaultValue={flows.at(0)}>
          <TabsList>
            {flows.map((flow) => (
              <TabsTrigger key={flow} value={flow}>
                {flow}
              </TabsTrigger>
            ))}
          </TabsList>
          <ClientCredentials type="clientCredentials" scheme={scheme} id={id} />
          <ClientCredentials type="authorizationCode" scheme={scheme} id={id} />
        </Tabs>
      </CardContent>
    </Card>
  );
}
