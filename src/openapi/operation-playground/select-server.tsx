import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sane-ts/shadcn-ui";

import { useOperation } from "#openapi/context";
import { useServer } from "#openapi/operation-playground/create-request";

/**
 * Render a server selection control that displays the current server and lets the user pick another.
 *
 * If there is no current server, renders a destructive badge indicating no available servers.
 *
 * @returns A JSX element containing the server select UI or a fallback badge when no server is available.
 */
export function SelectServer() {
  const { servers } = useOperation();
  const { server, idx, setIdx } = useServer();

  if (!server)
    return (
      <Badge className="inline max-w-full truncate" variant={"destructive"}>
        No Available servers! Using current origin /
      </Badge>
    );

  return (
    <Select
      value={idx.toString()}
      onValueChange={(v) => {
        setIdx(Number(v));
      }}
    >
      <SelectTrigger className="overflow-hidden">
        <SelectValue>
          <code className="truncate">{server.url}</code>
          {"name" in server && typeof server.name === "string" && (
            <Badge variant={"secondary"}>{server.name}</Badge>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {servers.map((server, i) => (
          <SelectItem key={server.url} value={i.toString()}>
            <code>{server.url}</code>
            {"name" in server && typeof server.name === "string" && (
              <Badge variant={"secondary"}>{server.name}</Badge>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}