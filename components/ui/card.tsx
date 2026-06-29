import * as React from "react";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type CardVariant = "default" | "glass" | "elevated";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/* ------------------------------------------------------------------ */
/* Style maps                                                          */
/* ------------------------------------------------------------------ */

const variantStyles: Record<CardVariant, string> = {
  default: "bg-navy-800 border border-white/10",
  glass: "glass shadow-lg shadow-black/20",
  elevated:
    "bg-navy-800/95 border border-white/10 shadow-xl shadow-black/30 backdrop-blur-md",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

const baseStyles = "rounded-2xl transition-all duration-300";

const interactiveStyles =
  "hover:border-white/20 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 cursor-pointer";

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function CardImpl(
  {
    className,
    variant = "default",
    padding = "md",
    interactive = false,
    ...props
  }: CardProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        interactive && interactiveStyles,
        className,
      )}
      {...props}
    />
  );
}

export const Card = React.forwardRef(CardImpl);
Card.displayName = "Card";

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function CardHeaderImpl(
  { className, ...props }: CardHeaderProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-5", className)}
      {...props}
    />
  );
}
export const CardHeader = React.forwardRef(CardHeaderImpl);
CardHeader.displayName = "CardHeader";

function CardTitleImpl(
  { className, ...props }: CardTitleProps,
  ref: React.Ref<HTMLHeadingElement>,
) {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-tight text-white tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
export const CardTitle = React.forwardRef(CardTitleImpl);
CardTitle.displayName = "CardTitle";

function CardDescriptionImpl(
  { className, ...props }: CardDescriptionProps,
  ref: React.Ref<HTMLParagraphElement>,
) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-white/50 leading-relaxed", className)}
      {...props}
    />
  );
}
export const CardDescription = React.forwardRef(CardDescriptionImpl);
CardDescription.displayName = "CardDescription";

function CardContentImpl(
  { className, ...props }: CardContentProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  );
}
export const CardContent = React.forwardRef(CardContentImpl);
CardContent.displayName = "CardContent";

function CardFooterImpl(
  { className, ...props }: CardFooterProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-5 pt-0", className)}
      {...props}
    />
  );
}
export const CardFooter = React.forwardRef(CardFooterImpl);
CardFooter.displayName = "CardFooter";

export default Card;