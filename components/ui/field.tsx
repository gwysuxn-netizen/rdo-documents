import * as React from "react"
import { cn } from "@/lib/utils"

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'vertical' | 'horizontal';
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <div
      className={`flex ${
        orientation === 'horizontal' 
          ? 'flex-row gap-2 sm:gap-3' 
          : 'flex-col gap-2'
      } ${className || ''}`}
      ref={ref}
      {...props}
    />
  )
)
Field.displayName = "Field"

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-3 space-y-1", className)}
    {...props}
  />
))
FieldGroup.displayName = "FieldGroup"

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs font-light text-gray-700 uppercase tracking-wider",
      className
    )}
    {...props}
  />
))
FieldLabel.displayName = "FieldLabel"

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-gray-600 font-light", className)}
    {...props}
  />
))
FieldDescription.displayName = "FieldDescription"

const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative flex items-center gap-4 my-3", className)}
    {...props}
  >
    <div className="flex-1 border-t border-gray-300/40" data-slot="field-separator-content" />
    {children && (
      <span className="text-xs text-gray-600 font-light px-2" data-slot="field-separator-content">
        {children}
      </span>
    )}
    <div className="flex-1 border-t border-gray-300/40" data-slot="field-separator-content" />
  </div>
))
FieldSeparator.displayName = "FieldSeparator"

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldSeparator }
