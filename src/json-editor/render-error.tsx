import { Alert, AlertDescription, AlertTitle } from "@sane-ts/shadcn-ui";

export function RenderError({
  error,
  children,
  ...props
}: { error: unknown } & React.ComponentProps<typeof Alert>) {
  const err =
    error instanceof Error
      ? error
      : { name: "Unknown Error", message: JSON.stringify(error) };

  const cause =
    err.cause instanceof Error ? (
      <RenderError error={err.cause} />
    ) : (
      <pre hidden={!err.cause} className="mt-2 whitespace-pre-wrap">
        {JSON.stringify(err.cause ?? "")}
      </pre>
    );

  return (
    <Alert {...props} variant={props.variant ?? "destructive"}>
      <AlertTitle className="flex items-center gap-2">
        {err.name} {children}
      </AlertTitle>
      <AlertDescription className="text-balance">
        {err.message} {cause}
      </AlertDescription>
    </Alert>
  );
}
