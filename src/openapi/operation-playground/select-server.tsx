import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sane-ts/shadcn-ui";

import { useOperation } from "#openapi/context";
import { useFormContext } from "#openapi/operation-playground/create-request";

export function SelectServer() {
  const { servers } = useOperation();
  const { serverIdx, setState } = useFormContext();

  const server = servers.at(serverIdx);
  if (!server)
    return (
      <Badge className="inline max-w-full truncate" variant={"destructive"}>
        No Available servers! Using current origin /
      </Badge>
    );

  return (
    <Select
      value={serverIdx.toString()}
      onValueChange={(v) => {
        setState((s) => ({ ...s, serverIdx: Number(v) }));
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
