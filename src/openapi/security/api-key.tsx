import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Input,
  Label,
} from "@sane-ts/shadcn-ui";
import { Lock, LockOpen } from "@sane-ts/shadcn-ui/lucide";
import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { Description } from "#description";
import { useLocalStorage } from "#hooks/use-local-storage";

export function ApiKeySecurityScheme({
  path,
  scheme,
}: {
  scheme: OpenAPIV3_1.ApiKeySecurityScheme;
  path: string[];
}) {
  const name = path.at(-1) || "apiKey";
  // const id = name + "-" + scheme.type;
  const id = name;
  const [secret, setSecret] = useLocalStorage<string>(id, "");
  return (
    <Card className="gap-0">
      <CardHeader>
        <h3 className="flex items-center gap-2">
          {secret ? <Lock /> : <LockOpen className="text-destructive" />}
          <span className="text-2xl">{name}</span>
          <Badge className="ml-auto">{scheme.type}</Badge>
          in
          <Badge variant={"secondary"}>{scheme.in}</Badge>
        </h3>
      </CardHeader>
      <CardContent>
        <Description {...scheme} path={path} />
        <Label className="mt-2 grid gap-1">
          <i>{scheme.name}:</i>
          <code>
            <Input
              value={secret}
              onChange={(e) => {
                setSecret(e.target.value);
              }}
            />
          </code>
        </Label>
      </CardContent>
    </Card>
  );
}
