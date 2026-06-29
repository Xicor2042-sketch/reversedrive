"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  /** Show the close (X) button in the corner. @default true */
  showClose?: boolean;
  className?: string;
}

export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface ModalTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface ModalDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/* ------------------------------------------------------------------ */
/* Modal — bottom sheet with slide-up animation                        */
/* ------------------------------------------------------------------ */

function ModalImpl(
  {
    open,
    defaultOpen,
    onOpenChange,
    children,
    showClose = true,
    className,
  }: ModalProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <DialogPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {(open !== undefined ? open : true) && (
            <>
              {/* Overlay */}
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in"
                />
              </DialogPrimitive.Overlay>

              {/* Content — bottom sheet */}
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  ref={ref}
                  initial={{ y: "100%", opacity: 0.5 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "100%", opacity: 0.5 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                  className={cn(
                    "fixed left-1/2 bottom-0 z-50 w-full max-w-lg -translate-x-1/2",
                    "rounded-t-2xl bg-navy-800/95 backdrop-blur-xl",
                    "border-t border-x border-white/10",
                    "shadow-2xl shadow-black/50",
                    "max-h-[90vh] flex flex-col overflow-hidden",
                    "focus:outline-none",
                    className,
                  )}
                >
                  {/* Drag handle */}
                  <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <span className="h-1 w-10 rounded-full bg-white/20" />
                  </div>

                  {showClose && (
                    <DialogPrimitive.Close
                      className="absolute right-4 top-3 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </DialogPrimitive.Close>
                  )}

                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const Modal = React.forwardRef(ModalImpl);
Modal.displayName = "Modal";

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ModalHeaderImpl(
  { className, ...props }: ModalHeaderProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-5 pb-3 shrink-0", className)}
      {...props}
    />
  );
}
export const ModalHeader = React.forwardRef(ModalHeaderImpl);
ModalHeader.displayName = "ModalHeader";

function ModalTitleImpl(
  { className, ...props }: ModalTitleProps,
  ref: React.Ref<HTMLHeadingElement>,
) {
  return (
    <DialogPrimitive.Title asChild>
      <h2
        ref={ref}
        className={cn(
          "text-lg font-semibold text-white tracking-tight",
          className,
        )}
        {...props}
      />
    </DialogPrimitive.Title>
  );
}
export const ModalTitle = React.forwardRef(ModalTitleImpl);
ModalTitle.displayName = "ModalTitle";

function ModalDescriptionImpl(
  { className, ...props }: ModalDescriptionProps,
  ref: React.Ref<HTMLParagraphElement>,
) {
  return (
    <DialogPrimitive.Description asChild>
      <p
        ref={ref}
        className={cn("text-sm text-white/50 leading-relaxed", className)}
        {...props}
      />
    </DialogPrimitive.Description>
  );
}
export const ModalDescription = React.forwardRef(ModalDescriptionImpl);
ModalDescription.displayName = "ModalDescription";

function ModalBodyImpl(
  { className, ...props }: ModalBodyProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto p-5 pt-3", className)}
      {...props}
    />
  );
}
export const ModalBody = React.forwardRef(ModalBodyImpl);
ModalBody.displayName = "ModalBody";

function ModalFooterImpl(
  { className, ...props }: ModalFooterProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-3 p-5 pt-3 shrink-0",
        className,
      )}
      {...props}
    />
  );
}
export const ModalFooter = React.forwardRef(ModalFooterImpl);
ModalFooter.displayName = "ModalFooter";

export default Modal;