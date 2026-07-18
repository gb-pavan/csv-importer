import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("glass-panel min-w-0 rounded-2xl p-4 sm:p-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";
