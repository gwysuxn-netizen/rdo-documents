import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium text-xs sm:text-sm transition-all px-3 sm:px-4 py-1.5 sm:py-2.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md gap-2';
    
    const variantStyles = variant === 'outline' 
      ? 'bg-white/50 backdrop-blur border-2 border-gray-300/40 text-gray-700 hover:bg-white/60'
      : 'bg-black text-white hover:bg-gray-900';

    return (
      <button
        className={cn(baseStyles, variantStyles, className)}
        ref={ref}
        {...props}
      />
    );
  }
)
Button.displayName = "Button"

export { Button }
