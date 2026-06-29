"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Style maps                                                          */
/* ------------------------------------------------------------------ */

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-neon-blue text-white shadow-lg shadow-neon-blue/20 hover:bg-neon-blue-light hover:shadow-neon-blue/30",
  secondary:
    "bg-white/5 text-white border border-white/10 backdrop-blur-md hover:bg-white/10 hover:border-white/20",
  destructive:
    "bg-red text-white shadow-lg shadow-red/20 hover:bg-red-light",
  ghost:
    "bg-transparent text-white/80 hover:bg-white/5 hover:text-white",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg gap-1.5",
  md: "h-11 px-5 text-sm rounded-xl gap-2",
  lg: "h-13 px-7 text-base rounded-xl gap-2.5",
};

const baseStyles =
  "inline-flex items-center justify-center font-medium whitespace-nowrap transition-colors duration-200 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function ButtonImpl(
  {
    className,
    variant = "primary",
    size = "md",
    asChild = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  const Comp = asChild ? Slot : (motion.button as React.ElementType);

  const motionProps = asChild
    ? {}
    : {
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 300, damping: 30 },
      };

  // When using asChild, the child element receives the classes.
  // Slot doesn't understand motion props, so we only pass them to motion.button.
  const content = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {children}
    </>
  ) : (
    <>
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </>
  );

  return (
    <Comp
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      disabled={disabled || loading}
      {...motionProps}
      {...props}
    >
      {content}
    </Comp>
  );
}

export const Button = React.forwardRef(ButtonImpl);
Button.displayName = "Button";

export default Button;