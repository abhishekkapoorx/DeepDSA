"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<HTMLDivElement | HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => {
    const Comp = orientation === "horizontal" ? "hr" : "div";
    return (
      <Comp
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        ref={ref as any}
        {...(decorative && { "aria-hidden": true })}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";

export { Separator };
