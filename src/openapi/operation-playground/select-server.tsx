import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@sane-ts/shadcn-ui";
import { useController } from "react-hook-form";

import { useOperation } from "#openapi/context";
import { control } from "#openapi/operation-playground/create-request";

export function SelectServer() {
  const { servers } = useOperation();
  const controller = useController({ control, name: "serverIdx" });
  const { value, onChange, ...field } = controller.field;

  const server = servers.at(value);
  if (!server)
    return (
      <Badge className="inline max-w-full truncate" variant={"destructive"}>
        No Available servers! Using current origin /
      </Badge>
    );

  return (
    <Select
      value={value.toString()}
      onValueChange={(v) => {
        onChange(Number(v));
      }}
    >
      <SelectTrigger className="overflow-hidden" {...field}>
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
