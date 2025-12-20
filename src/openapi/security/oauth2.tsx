import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Input,
  Label,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sane-ts/shadcn-ui";
import {
  Copy,
  Fullscreen,
  KeyRound,
  Lock,
  LockOpen,
} from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";
import { useActionState } from "react";

import { Description } from "#description";
import { useSecurityScheme } from "#openapi/operation-playground/create-request";

function Form<T>({
  initialState,
  action,
  children,
  ...props
}: Omit<React.ComponentProps<"form">, "action" | "children"> & {
  action: (prev: Awaited<T>, data: FormData) => Promise<T>;
  initialState: Awaited<T>;
  children: (state: Awaited<T>, pending: boolean) => React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(
    (prev: Awaited<T>, formData: FormData) => action(prev, formData),
    initialState,
  );
  return (
    <form {...props} action={formAction}>
      {children(state, pending)}
    </form>
  );
}

const SCOPE = "scope";
function OAuthFlow(flow: {
  name: string; // e.g. authorizationCode, clientCredentials, etc.
  tokenUrl?: string;
  scopes?: Record<string, string>;
  refreshUrl?: string;
  setToken: (token: string) => void;
}) {
  // TODO: add request/response viewer similar how we have for operations
  return (
    <TabsContent asChild className="grid gap-2" value={flow.name}>
      <Form
        ref={(e) => void (e && (e.reset = () => null))}
        initialState={""}
        action={async (_, formData) => {
          if (!flow.tokenUrl) return "";
          const minDelay = new Promise((r) => void setTimeout(r, 300));
          const scopes = formData.getAll(SCOPE);
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          scopes.length && formData.set(SCOPE, scopes.join(" "));

          // @ts-expect-error all entries values are strings
          const body = new URLSearchParams(formData);
          const resp = await fetch(flow.tokenUrl, { method: "POST", body });
          if (!resp.ok) {
            return "";
          }
          const json = (await resp.json()) as { access_token: string };
          flow.setToken(json.access_token);
          await minDelay;
          return json.access_token;
        }}
      >
        {(token, pending) => (
          <fieldset disabled={pending || !flow.tokenUrl} className="grid gap-2">
            {flow.refreshUrl && (
              <p>
                Refresh URL: <code>{flow.refreshUrl}</code>
              </p>
            )}
            <p>
              Token URL: <code>{flow.tokenUrl}</code>
            </p>
            <input type="hidden" name="grant_type" value="client_credentials" />
            <Label className="mt-2 grid gap-1">
              <i>Client Id:</i>
              <code>
                <Input required name="client_id" autoComplete="username" />
              </code>
            </Label>
            <Label className="mt-2 grid gap-1">
              <i>Client Secret:</i>
              <code>
                <Input
                  required
                  name="client_secret"
                  autoComplete="current-password"
                  type="password"
                />
              </code>
            </Label>
            {Object.entries(flow.scopes ?? {}).map(([name, value]) => (
              <Label className="mt-1" key={name}>
                <Checkbox value={name} name={SCOPE} />
                {name}: {value}
              </Label>
            ))}
            <Button disabled={pending}>
              {pending ? <Spinner /> : <KeyRound />} Fetch Token
            </Button>

            <div
              hidden={!token}
              className="flex items-center gap-1 overflow-hidden"
            >
              <Button
                hidden // TODO implement JWT viewer
                type="button"
                variant={"ghost"}
                size={"icon-sm"}
                className="cursor-pointer"
                aria-label="View token details"
              >
                <Fullscreen />
              </Button>
              <Button
                type="button"
                variant={"ghost"}
                size={"icon-sm"}
                className="cursor-pointer"
                aria-label="Copy token to clipboard"
                onClick={() => void navigator.clipboard.writeText(token)}
              >
                <Copy />
              </Button>
              <label
                onMouseDown={(e) => e.detail > 1 && e.preventDefault()}
                className="inline-block w-full cursor-pointer truncate font-mono"
              >
                <input
                  className="peer sr-only"
                  aria-label="Toggle token visibility"
                  type="checkbox"
                />
                <span className="hidden peer-checked:inline">{token}</span>
                <span className="peer-checked:hidden">
                  {"*".repeat(token.length)}
                </span>
              </label>
            </div>
          </fieldset>
        )}
      </Form>
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
  const [secret, setSecret] = useSecurityScheme(name);

  const flows = Object.keys(scheme.flows ?? {});
  return (
    <Card className="gap-0">
      <CardHeader>
        <h3 className="flex items-center gap-2">
          {secret?.value ? <Lock /> : <LockOpen className="text-destructive" />}
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
          {Object.entries(scheme.flows ?? {}).map(([k, v]) => (
            <OAuthFlow
              key={k}
              name={k}
              {...v}
              setToken={(value) =>
                setSecret({
                  in: "header",
                  name: "Authorization",
                  value: `Bearer ${value}`,
                })
              }
            />
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
