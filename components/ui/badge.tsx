import * as React from "react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

/* ------------------------------------------------------------------ */
/* Style maps                                                          */
/* ------------------------------------------------------------------ */

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-white/80 border-white/15",
  success: "bg-emerald/15 text-emerald-light border-emerald/30",
  warning: "bg-amber/15 text-amber-light border-amber/30",
  danger: "bg-red/15 text-red-light border-red/30",
  info: "bg-neon-blue/15 text-neon-blue-light border-neon-blue/30",
};

const dotColor: Record<BadgeVariant, string> = {
  default: "bg-white/50",
  success: "bg-emerald",
  warning: "bg-amber",
  danger: "bg-red",
  info: "bg-neon-blue",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5 gap-1",
  md: "text-sm px-2.5 py-1 gap-1.5",
};

const baseStyles =
  "inline-flex items-center rounded-full border font-medium whitespace-nowrap transition-colors";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function BadgeImpl(
  {
    className,
    variant = "default",
    size = "md",
    dot = false,
    children,
    ...props
  }: BadgeProps,
  ref: React.Ref<HTMLSpanElement>,
) {
  return (
    <span
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            dotColor[variant],
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}

export const Badge = React.forwardRef(BadgeImpl);
Badge.displayName = "Badge";

export default Badge;