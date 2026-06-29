"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  invalid?: boolean;
}

/* ------------------------------------------------------------------ */
/* Style maps                                                          */
/* ------------------------------------------------------------------ */

const sizeStyles: Record<InputSize, string> = {
  sm: "h-9 text-sm",
  md: "h-11 text-sm",
  lg: "h-13 text-base",
};

const baseStyles =
  "w-full rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder:text-white/35 font-sans transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-neon-blue/60 focus:ring-2 focus:ring-neon-blue/30 focus:bg-white/[0.06]";

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function InputImpl(
  {
    className,
    inputSize = "md",
    leftIcon,
    rightIcon,
    invalid,
    type = "text",
    ...props
  }: InputProps,
  ref: React.Ref<HTMLInputElement>,
) {
  const hasIcon = Boolean(leftIcon || rightIcon);

  if (hasIcon) {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 flex items-center justify-center text-white/40 [&_svg]:h-4 [&_svg]:w-4">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            baseStyles,
            sizeStyles[inputSize],
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            invalid &&
              "border-red/60 focus:border-red/60 focus:ring-red/30",
            className,
          )}
          aria-invalid={invalid || undefined}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 flex items-center justify-center text-white/40 [&_svg]:h-4 [&_svg]:w-4">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        sizeStyles[inputSize],
        "px-4",
        invalid && "border-red/60 focus:border-red/60 focus:ring-red/30",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export const Input = React.forwardRef(InputImpl);
Input.displayName = "Input";

export default Input;