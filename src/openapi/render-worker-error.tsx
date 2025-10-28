import { Alert, AlertDescription, AlertTitle } from "@sane-ts/shadcn-ui";

export function renderWorkerError(error: { title: string; body: string }) {
  return (
    <Alert variant={"destructive"} className="max-h-full overflow-auto">
      <AlertTitle>{error.title}</AlertTitle>
      <AlertDescription className="font-mono whitespace-pre">
        {error.body}
      </AlertDescription>
    </Alert>
  );
}
