"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {}

export interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}

export interface SelectContentProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

export interface SelectItemProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

export interface SelectGroupProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {}

export interface SelectLabelProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {}

export interface SelectSeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

/* ------------------------------------------------------------------ */
/* Select (root)                                                       */
/* ------------------------------------------------------------------ */

export function Select({ children, ...props }: SelectProps) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}
Select.displayName = "Select";

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

const triggerSizeStyles = {
  sm: "h-9 text-sm",
  md: "h-11 text-sm",
  lg: "h-13 text-base",
};

function SelectTriggerImpl(
  {
    className,
    children,
    size = "md",
    invalid,
    ...props
  }: SelectTriggerProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between rounded-xl gap-2",
        "bg-white/[0.04] border border-white/10 px-4 text-white",
        "transition-all duration-200",
        "placeholder:text-white/35",
        "focus:outline-none focus:border-neon-blue/60 focus:ring-2 focus:ring-neon-blue/30 focus:bg-white/[0.06]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "data-[placeholder]:text-white/35",
        invalid && "border-red/60 focus:border-red/60 focus:ring-red/30",
        triggerSizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}
export const SelectTrigger = React.forwardRef(SelectTriggerImpl);
SelectTrigger.displayName = "SelectTrigger";

/* ------------------------------------------------------------------ */
/* Value                                                               */
/* ------------------------------------------------------------------ */

export function SelectValue({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value
      className={cn("text-left truncate", className)}
      {...props}
    />
  );
}
SelectValue.displayName = "SelectValue";

/* ------------------------------------------------------------------ */
/* Content (dropdown)                                                  */
/* ------------------------------------------------------------------ */

function SelectContentImpl(
  { className, children, position = "popper", ...props }: SelectContentProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
          "relative z-50 max-h-72 min-w-[8rem] overflow-hidden",
          "rounded-xl bg-navy-800/95 backdrop-blur-xl border border-white/10",
          "shadow-2xl shadow-black/50",
          "data-[state=open]:animate-slide-up",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-8 items-center justify-center text-white/40">
          <ChevronUp className="h-4 w-4" />
        </SelectPrimitive.ScrollUpButton>

        <SelectPrimitive.Viewport className="p-1.5">
          {children}
        </SelectPrimitive.Viewport>

        <SelectPrimitive.ScrollDownButton className="flex h-8 items-center justify-center text-white/40">
          <ChevronDown className="h-4 w-4" />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}
export const SelectContent = React.forwardRef(SelectContentImpl);
SelectContent.displayName = "SelectContent";

/* ------------------------------------------------------------------ */
/* Item                                                                */
/* ------------------------------------------------------------------ */

function SelectItemImpl(
  { className, children, ...props }: SelectItemProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center",
        "rounded-lg py-2 pl-8 pr-3 text-sm text-white/80",
        "outline-none transition-colors",
        "focus:bg-white/10 focus:text-white",
        "data-[state=checked]:text-white",
        "data-[disabled]:opacity-50 data-[disabled]:pointer-events-none",
        className,
      )}
      {...props}
    >
      <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-neon-blue" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
export const SelectItem = React.forwardRef(SelectItemImpl);
SelectItem.displayName = "SelectItem";

/* ------------------------------------------------------------------ */
/* Group / Label / Separator                                          */
/* ------------------------------------------------------------------ */

export function SelectGroup({
  className,
  ...props
}: SelectGroupProps) {
  return <SelectPrimitive.Group className={cn("", className)} {...props} />;
}
SelectGroup.displayName = "SelectGroup";

export function SelectLabel({
  className,
  ...props
}: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn(
        "px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-white/40",
        className,
      )}
      {...props}
    />
  );
}
SelectLabel.displayName = "SelectLabel";

export function SelectSeparator({
  className,
  ...props
}: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-white/10", className)}
      {...props}
    />
  );
}
SelectSeparator.displayName = "SelectSeparator";

export default Select;