import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@sane-ts/shadcn-ui";

import {
  OperationContext,
  OperationStateContext,
  useProviderOperationState,
} from "#openapi/context";
import { OperationDocs } from "#openapi/operation-docs/index";
import { OperationPlayground } from "#openapi/operation-playground/index";

function OperationStateProvider(props: { children: React.ReactNode }) {
  const state = useProviderOperationState();
  return (
    <OperationStateContext value={state}>
      {props.children}
    </OperationStateContext>
  );
}

export function Operation(ctx: OperationContext) {
  return (
    <OperationContext value={ctx}>
      <OperationStateProvider>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            className="max-h-full p-4"
            style={{ overflow: "auto" }}
            minSize={2}
          >
            <OperationDocs />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            className="max-h-full p-4"
            style={{ overflow: "auto" }}
            defaultSize={40}
            minSize={2}
          >
            <OperationPlayground />
          </ResizablePanel>
        </ResizablePanelGroup>
      </OperationStateProvider>
    </OperationContext>
  );
}
