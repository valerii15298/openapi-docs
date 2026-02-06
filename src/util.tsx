import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@sane-ts/base-shadcn";
import { Triangle } from "@sane-ts/base-shadcn/lucide";
import type { ReactNode } from "react";

type Props = React.ComponentProps<typeof Collapsible> & {
  children: ReactNode;
  header: ReactNode;
};
export function Collapse({ header, children, ...props }: Props) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center gap-1">
        <Triangle className="fill-foreground w-3 rotate-90 transition-transform group-data-panel-open:rotate-180" />
        {header}
      </CollapsibleTrigger>
      <CollapsibleContent className="border-accent ml-1.5 border-l pl-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
