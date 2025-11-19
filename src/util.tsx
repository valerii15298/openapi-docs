import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@sane-ts/shadcn-ui";
import { Triangle } from "@sane-ts/shadcn-ui/lucide";
import type { ReactNode } from "react";

type Props = React.ComponentProps<typeof Collapsible> & {
  children: ReactNode;
  header: ReactNode;
};
export function Collapse({ header, children, ...props }: Props) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-1 data-[state=open]:[&>svg]:rotate-180">
        <Triangle className="fill-foreground w-3 rotate-90 transition-transform" />
        {header}
      </CollapsibleTrigger>
      <CollapsibleContent className="border-accent ml-1.5 border-l pl-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
