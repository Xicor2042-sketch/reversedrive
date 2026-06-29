"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: "sm" | "md" | "lg";
}

/* ------------------------------------------------------------------ */
/* Style maps                                                          */
/* ------------------------------------------------------------------ */

const rootSizeStyles = {
  sm: "h-5 w-9 data-[state=checked]:bg-neon-blue data-[state=unchecked]:bg-white/10",
  md: "h-6 w-11 data-[state=checked]:bg-neon-blue data-[state=unchecked]:bg-white/10",
  lg: "h-7 w-13 data-[state=checked]:bg-neon-blue data-[state=unchecked]:bg-white/10",
};

const thumbSizeStyles = {
  sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5",
  md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5",
  lg: "h-6 w-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5",
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function SwitchImpl(
  { className, size = "md", ...props }: SwitchProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full",
        "border border-white/10 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:shadow-lg data-[state=checked]:shadow-neon-blue/30",
        rootSizeStyles[size],
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0",
          "transition-transform duration-200 ease-out",
          thumbSizeStyles[size],
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export const Switch = React.forwardRef(SwitchImpl);
Switch.displayName = "Switch";

export default Switch;