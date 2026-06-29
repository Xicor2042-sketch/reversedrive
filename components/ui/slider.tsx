"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "value" | "defaultValue" | "onValueChange"
  > {
  /** Show a floating tooltip with the current value. */
  showTooltip?: boolean;
  /** Formatter for the tooltip (e.g. formatCurrency). */
  formatValue?: (value: number) => string;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function SliderImpl(
  {
    className,
    showTooltip = false,
    formatValue,
    value,
    defaultValue,
    onValueChange,
    max = 100,
    step = 1,
    ...props
  }: SliderProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const [internalValue, setInternalValue] = React.useState<number[]>(
    value ?? defaultValue ?? [0],
  );

  const current = value ?? internalValue;
  const displayValue = current[0] ?? 0;
  const formatted = formatValue
    ? formatValue(displayValue)
    : String(displayValue);

  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <SliderPrimitive.Root
        ref={ref}
        value={current}
        defaultValue={defaultValue}
        onValueChange={(v) => {
          setInternalValue(v);
          onValueChange?.(v);
        }}
        max={max}
        step={step}
        className="relative flex w-full touch-none select-none items-center"
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
          <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-neon-blue to-cyan" />
        </SliderPrimitive.Track>

        <SliderPrimitive.Thumb
          className="relative block h-5 w-5 rounded-full border-2 border-neon-blue bg-navy-900 shadow-lg shadow-neon-blue/30 transition-transform duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-neon-blue focus:ring-offset-2 focus:ring-offset-navy-950 active:scale-95"
          aria-label="Slider value"
        >
          {showTooltip && (
            <span
              className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-navy-700 px-2 py-1 text-xs font-medium text-white shadow-lg"
              style={{ left: `calc(50% )` }}
            >
              {formatted}
              <span
                className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-navy-700"
              />
            </span>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
}

export const Slider = React.forwardRef(SliderImpl);
Slider.displayName = "Slider";

export default Slider;